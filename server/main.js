import { Meteor } from 'meteor/meteor';
import '../imports/api/quests.js';
import '../imports/api/images.js';

Meteor.startup(() => {
  // code to run on server at startup
});

/*
Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'username': number, 'Name': string, 'LastName': string, 
                             adress: {'street': string, 'haus': number, 'plz': number, 'city': string } }});
  } else {
    this.ready();
  }
});
*/
