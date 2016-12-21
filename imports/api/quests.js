import { Mongo } from 'meteor/mongo';
 
export const Quests = new Mongo.Collection('quests');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('quests', function questsPublication() {
    return Quests.find();
  });
}