import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Quests = new Mongo.Collection('quests');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('quests', function questsPublication() {
    return Quests.find();
  });
}

Meteor.methods({
  'quests.insert'(quest) {
    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
 
    quest.owner =  { id: this.userId, username: Meteor.users.findOne(this.userId).username};
    quest.createdAt = new Date();

    Quests.insert(quest);
  },

  'quests.update'(id, status, tit, des, pr, aw, ze, k) {
      Quests.update(
      {_id :id},
      {$set: {
            Status : status, 
            title: tit,
            description:des,
            Priorität:pr,
            Arbeitsaufwand:aw,
            Zeiteinheit:ze,
            Kosten:k
        }
    });
  },

  'quests.take'(questId, status){
      Quests.update(
        {_id :questId},
        {$set: {
              Status : status, 
              assigneeId: this.userId,
              assigneeName: Meteor.users.findOne(this.userId).username,
          }
        });
    },

});