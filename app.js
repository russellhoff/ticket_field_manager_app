(function() {
    return {
        events: {
            'app.activated'                             : 'onActivated',
            'ticket.custom_field_22096608.changed'      : 'handleField'
        },

        onActivated: function() {
            if (this.ticketIsTarget()){
                this.disableSave();
                this.handleField();
            }
        },

        handleField: function(){
            if (this.ticketIsTarget()){
                if (_.isEmpty(this.fieldValue())){
                    this.disableSave();
                } else {
                    this.enableSave();
                }
            }
        },

        ticketIsTarget: function(){
            if (_.contains(["new", "open", "pending"], this.ticket().status()))
                return true;
            return false;
        },

        field: function(){
            if (_.isEmpty(this._field))
                this._field = this.ticketFields(this.fieldSelector());
            return this._field;
        },

        fieldValue: function(){
            return this.ticket().customField(this.fieldSelector());
        },

        fieldSelector: function(){
            return 'custom_field_22096608';
        }

    };

}());
