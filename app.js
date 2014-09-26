(function() {
  return {
    fieldsOnError: [],
    requests: {
      fetchUser: function() {
        return {
          url: helpers.fmt('/api/v2/users/%@.json?include=groups,organizations',
                           this.currentUser().id()),
          dataType: 'json',
          type: 'GET'
        };
      }
    },

    events: {
      'app.activated'             : 'onAppActivated',
      'fetchUser.done'            : 'onFetchUserDone',
      'fetchUser.fail'            : 'onFetchUserFail',
      'fetchUserNoCallback.fail'  : 'onFetchUserFail',
      'ticket.save'               : 'onTicketSave',
      '*.changed'                 : 'onFieldChanged'
    },

    currentUserData: function(data) {
      data = data || this.store('ticketfieldmanager_user');

      if (_.isUndefined(data)) {
        this.ajax('fetchUser');
      } else {
        if (_.isUndefined(data.user) || _.isUndefined(data.user.tags) || _.isUndefined(data.organizations) || _.isUndefined(data.groups)) {
          // display error
          services.notify(this.I18n.t('app_api_user_issues', { 
            installationId: this.installationId(), 
            currentUserId: this.currentUser().id(),
            installationName: this.setting('name')
          }), 'error', 30000);
        } else {
          if (data.user.id == this.currentUser().id()) {
            this.store('ticketfieldmanager_user', data);
            return data;  
          } else {
            this.ajax('fetchUser');
          }
        }
      }
    },

    onAppActivated: function(app) {
      this.ajax('fetchUser');
    },

    onFetchUserDone: function(data) {
      this.currentUserData(data);
      this.onFieldChanged();
    },

    onFetchUserFail: function(xhr, text_status, error_thrown) {
      if (text_status != "abort") {
        services.notify(this.I18n.t('app_connectivity_issues_with_name', { 
              installationId: this.installationId(), 
              currentUserId: this.currentUser().id(),
              installationName: this.setting('name')
            }), 'error', 30000);
      }
    },

    onTicketSave: function() {
      // Check if User exists
      if (this.currentUserData()) {
        // User exists
        this.onTicketSaveContinue();
      } else {
        return false;
      }
    },

    onTicketSaveContinue: function() {
      var fieldsOnError = this.validateRequiredFields();

      if (!_.isEmpty(fieldsOnError)) {
        return this.I18n.t('invalid_fields', { fields: this.fieldsLabel(fieldsOnError).join(',') });
      }
        
      return true;
    },

    onFieldChanged: function() {
      if (!this.currentUserData()) return;

      _.defer(this.handleFields.bind(this));
    },

    handleFields: function() {
      this.handleHiddenFields();
      this.handleReadOnlyFields();
    },

    validateRequiredFields: function() {
      return _.filter(this.requiredFields(), function(field) {
        return !this.fieldIsValid(field);
      }, this);
    },

    handleHiddenFields: function() {
      this.hiddenFields().forEach(function(field) {
        this.applyActionOnField(field, 'hide');
      }, this);
    },

    handleReadOnlyFields: function() {
      this.readOnlyFields().forEach(function(field) {
        this.applyActionOnField(field, 'disable');
      }, this);
    },

    applyActionOnField: function(field, action) {
      var splittedField = field.split('.'),
      fieldName = splittedField[0],
      optionValue = splittedField[1],
      ticketField = this.ticketFields(fieldName);

      if (!ticketField) { return false; }

      if (optionValue && ticketField.options()) {
        var option = _.find(ticketField.options(), function(opt) {
          return opt.value() == optionValue;
        });

        if (option) {
          option[action]();
        }
      } else {
        ticketField[action]();
      }
    },

    requiredFields: _.memoize(function() {
      return this.fields('required_fields');
    }),

    hiddenFields: _.memoize(function() {
      return this.fields('hidden_fields');
    }),

    readOnlyFields: _.memoize(function() {
      return this.fields('readonly_fields');
    }),

    fields: function(type) {
      if (this.currentUserIsWithlistedFor(type))
        return [];
      return this.splittedSetting(type);
    },

    currentUserIsWithlistedFor: function(type) {
      return _.any([
        this.currentUserIsWhitelistedByTagFor(type),
        this.currentUserIsWhitelistedByGroupFor(type),
        this.currentUserIsWhitelistedByOrganizationFor(type)
      ]);
    },

    currentUserIsWhitelistedByTagFor: function(type) {
      var tags = this.splittedSetting(type + '_whitelist_tags');

      return this.deepContains(this.currentUserData().user.tags, tags);
    },

    currentUserIsWhitelistedByGroupFor: function(type) {
      var group_ids = this.splittedSetting(type + '_whitelist_group_ids'),
          current_group_ids = _.map(this.currentUserData().groups, function(group) {
            return String(group.id);
          });

      return this.deepContains(current_group_ids, group_ids);
    },

    currentUserIsWhitelistedByOrganizationFor: function(type) {
      var organization_ids = this.splittedSetting(type + '_whitelist_organization_ids'),
          current_organization_ids = _.map(this.currentUserData().organizations, function(organization) {
            return String(organization.id);
          });

      return this.deepContains(current_organization_ids, organization_ids);
    },

    //list and values should be Arrays
    deepContains: function(list, values) {
      var flattened_contains = _.inject(values, function(memo, value) {
        memo.push(_.contains(list, value));
        return memo;
      }, []);

      return _.any(flattened_contains);
    },

    splittedSetting: function(name) {
      return _.compact((this.setting(name) || '').split(','));
    },

    fieldIsValid: function(field) {
      var value = _.clone(this.containerContext().ticket[field]);

      // field is present and is empty
      if (this.ticketFields(field) &&
          (_.isEmpty(value) || value == '-' ||
           (field == "type" && value == "ticket"))) {
        return false;
      }

      return true;
    },

    fieldsLabel: function(fields) {
      return _.map(fields, function(field) {
        var tf = this.ticketFields(field),
            label = this.ticketFields(field) && this.ticketFields(field).label();

        if (label) {
          return label;
        } else {
          return field;
        }
      }, this);
    }
  };
}());
