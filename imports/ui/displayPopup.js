  import './displayPopup.html';
  import { Quests } from '../api/quests.js';
  import { Session } from 'meteor/session';

  
  Template.displayPopup.helpers({
    quest: function () {
        var questId = Session.get('m_id');
        var selectedQuest = Quests.findOne({ _id: questId  });
        return selectedQuest;
    }
  });
  
    // Template.displayPopup.events({
    //     'click .annehmen'(event) {
    //         var openQuestId = Session.get('openQuestId');
    //         Meteor.call('quests.take', openQuestId, "bearbeitung");
    //         console.log("Quest (" + openQuestId + ") angenommen");
    //     },

    //     'submit .popUpForm'(event) {
    //         // Prevent default browser form submit
    //         event.preventDefault();
    //         editQuest();
    //     },
    // });