(function() {
  return {
    doneLoading: false,
    fieldsOnError: [],
    requests: {
      fetchUser: function(){
        return {
          url: '/api/v2/users/'+ this.currentUser().id() + '.json?include=groups,organizations'
        };
      }
    },

    events: {
      'app.activated'           : 'initializeIfReady',
      'ticket.status.changed'   : 'initializeIfReady',
      'fetchUser.done'          : 'initialize',
      '*.changed'               : 'handleFieldEvent'
    },

    isReady: function(){
      return !this.doneLoading &&
        this.ticket() &&
        this.ticket().status() &&
        _.contains(["new", "open", "pending"], this.ticket().status());
    },

    initializeIfReady: function(){
      if (this.isReady()){
        this.ajax('fetchUser');
      }
    },

    initialize: function(data){
      this.doneLoading = true;
      this.data = data;
      this.handleRequiredFields();
      this.handleHiddenFields();
      this.handleReadOnlyFields();
    },

    handleRequiredFields: function(){
      this.requiredFields().forEach(function(field){
        this.validateField(field);
      }, this);

      this.renderErrorIfAny();
    },

    handleHiddenFields: function(){
      this.hiddenFields().forEach(function(field){
        this.ticketFields(field).hide();
      }, this);
    },

    handleReadOnlyFields: function(){
      this.readOnlyFields().forEach(function(field){
        this.ticketFields(field).disable();
      }, this);
    },

    handleFieldEvent: function(event){
      // remove 'ticket.' from the event's propertyName in order to match our requiredFields
      var field = event.propertyName.replace('ticket.', '');

      if (_.contains(this.requiredFields(), field) &&
          this.doneLoading){
        this.validateField(field);
        this.renderErrorIfAny();
      }
    },

    renderErrorIfAny: function(){
      if (_.isEmpty(this.fieldsOnError)){
        this.enableSave();
        this.switchTo('blank');
      } else {
        this.disableSave();
        this.switchTo('error', { fields: this.fieldsLabel(this.fieldsOnError) });
      }
    },

    requiredFields: _.memoize(function(){
      return this.fields('required_fields');
    }),

    hiddenFields: _.memoize(function(){
      return this.fields('hidden_fields');
    }),

    readOnlyFields: _.memoize(function(){
      return this.fields('readonly_fields');
    }),

    fields: function(type){
      if (this.currentUserIsWithlistedFor(type))
        return [];
      return this.splittedSetting(type);
    },

    currentUserIsWithlistedFor: function(type){
      return _.any([
        this.currentUserIsWhitelistedByTagFor(type),
        this.currentUserIsWhitelistedByGroupFor(type),
        this.currentUserIsWhitelistedByOrganizationFor(type)
      ]);
    },

    currentUserIsWhitelistedByTagFor: function(type){
      var tags = this.splittedSetting(type + '_whitelist_tags');

      return this.deepContains(this.data.user.tags, tags);
    },

    currentUserIsWhitelistedByGroupFor: function(type){
      var group_ids = this.splittedSetting(type + '_whitelist_group_ids');
      var current_group_ids = _.map(this.data.groups, function(group){
        return String(group.id);
      });

      return this.deepContains(current_group_ids, group_ids);
    },

    currentUserIsWhitelistedByOrganizationFor: function(type){
      var organization_ids = this.splittedSetting(type + '_whitelist_organization_ids');
      var current_organization_ids = _.map(this.data.organizations, function(organization){
        return String(organization.id);
      });

      return this.deepContains(current_organization_ids, organization_ids);
    },

    //list and values should be Arrays
    deepContains: function(list, values){
      var flattened_contains = _.inject(values, function(memo, value){
        memo.push(_.contains(list, value));
        return memo;
      }, []);

      return _.any(flattened_contains);
    },

    splittedSetting: function(name){
      return _.compact((this.setting(name) || '').split(','));
    },

    validateField: function(field){
      var value = this.containerContext().ticket[field];

      var newFieldsOnError = [];

      if (_.isEmpty(value) || value == '-'){
        newFieldsOnError = _.union(this.fieldsOnError, [field]);
      } else {
        newFieldsOnError = _.without(this.fieldsOnError, field);
      }
      this.fieldsOnError = newFieldsOnError;
    },

    fieldsLabel: function(fields){
      return _.map(fields, function(field){
        return this.ticketFields(field).label();
      }, this);
    }
  };
}());
