(function() {
  // Replace {{ID}} by your custom field id.
  return {
    doneLoading: false,
    fieldSelector: 'custom_field_{{ID}}',

    events: {
      'app.activated'                           : 'initializeIfReady',
      'ticket.status.changed'                   : 'initializeIfReady',
      'ticket.custom_field_{{ID}}.changed'    : 'handleField'
    },

    initializeIfReady: function(){
      if (!this.doneLoading &&
          this.ticket() &&
          this.ticket().id() &&
          this.ticketIsTarget()){

        this.handleField();
        this.doneLoading = true;
      }
    },

    handleField: function(){
      if (_.isEmpty(this.fieldValue())){
        services.appsTray().show();

        this.updateHeader(this.renderTemplate('error', {
          label: this.ticketFields(this.fieldSelector).label() }));

        this.disableSave();
      } else {
        this.updateHeader('');

        this.enableSave();
      }
    },

    ticketIsTarget: function(){
      if (_.contains(["new", "open", "pending"], this.ticket().status()))
        return true;
      return false;
    },

    fieldValue: function(){
      return this.ticket().customField(this.fieldSelector);
    },

    updateHeader: function(value){
      return this.$('header').html(value);
    }
  };
}());
