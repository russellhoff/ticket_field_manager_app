# Ticket Field Manager

## Available Required/Hidden/ReadOnly fields
* assignee
* collaborator
* type
* priority
* tag
* custom_field_ID  `(Example: custom_field_1234)`

Basically, you can use every field supported by the [Interface Api](http://goo.gl/XUrP5).

## Whitelist Users

You can whitelist users from the settings. See the example for more information:
```json
{                                                                                                                                                                                                                               
  "required_fields": {                                                                                                                                                                                                          
    "tag": "admin" // The fields wont be required if the user has the 'admin' tag                                                                                                                                               
  },                                                                                                                                                                                                                            
  "hidden_fields": {                                                                                                                                                                                                            
    "group_id": 42424242 // The fields wont be hidden if the user is part of the group with id 42424242                                                                                                                       
  },                                                                                                                                                                                                                            
  "readonly_fields": {                                                                                                                                                                                                          
    "organization_id": 42424242 // The fields wont be readonly if the user is part of the organization with id 42424242                                                                                                       
  }                                                                                                                                                                                                                             
}
```
