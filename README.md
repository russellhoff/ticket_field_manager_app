:warning: *Use of this software is subject to important terms and conditions as set forth in the License file* :warning:

# Ticket Field Manager
An app to require/hide/disable fields in your agent interface.

### Available Fields
* requester
* assignee
* collaborator
* sharedWith
* status
* ticket_form_id (the ticket form dropdown)
* tags
* type
* priority
* problem
* custom_field_ID  `(Example: custom_field_1234)`

You can also hide/disable options for a given dropdown field. Here's some examples:
* status.pending
* custom_field_23049272.third_option
* assignee.21312636 (21312636 is the ID of a group)
* assignee.21312636:422450083 (21312636 is the group ID and 422450083 is the user ID)

By downloading this app, you are agreeing to our [terms and conditions](https://github.com/zendesklabs/wiki/wiki/Terms-and-Conditions)


====================

### Updates
##### 4.1.1 - Error handling and better support for multiple Ticket Field Manager apps in one account
- Updated app to include better and more useful error handling. 
![](https://www.evernote.com/shard/s282/sh/c9686f98-3f36-450d-81c5-e86061f0f6b3/973bed7a8fe79eda83d5092b2288061c/deep/0/BenMatthew-Hub---Agent.png)

- The app will also use the metadata store across apps to cache REST API calls to the /users/{id}.json end-point (for current user). This will help reduce save hook timeouts. The app will however make calls to the /users/{id}.json on App.activated to ensure data is up-to-date