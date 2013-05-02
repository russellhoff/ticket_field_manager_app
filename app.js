(function() {
  return {
    doneLoading: false,
    fieldsOnError: [],
    events: {
      'app.activated'           : 'initializeIfReady',
      'ticket.status.changed'   : 'initializeIfReady',
      '*.changed'               : 'handleFieldEvent'
    },

    isReady: function(){
      return !this.doneLoading &&
        this.ticket() &&
        _.contains(["new", "open", "pending"], this.ticket().status());
    },

    initializeIfReady: function(){
      if (this.isReady()){
        this.requiredFields().forEach(function(field){
          this.validateField(field);
        }, this);

        this.renderErrorIfAny();
        this.doneLoading = true;
      }
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
      return this.setting('required_fields').split(',');
    }),

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

    fieldsLabel: function(field){
      return _.map(field, function(field){
        return this.ticketFields(field).label();
      }, this);
    }
  };
}());
