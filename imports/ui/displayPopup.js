  import './displayPopup.html';
  import { Quests } from '../api/quests.js';
  import { Session } from 'meteor/session';

  
  Template.displayPopup.helpers({
    // quest: function () {
    //     var questId = Session.get('m_id');
    //     var selectedQuest = Quests.findOne({ _id: questId  });
    //     console.log("Helper method called: " + questId);
    //     return selectedQuest;
    // }
  });
  
    Template.displayPopup.events({
        'submit .popUpForm'(event) {
            // Prevent default browser form submit
            event.preventDefault();
            
            var questId = Session.get('openQuestId');
            var selectedQuest = Quests.findOne({ _id: questId  });

            var parent = document.createElement("div");
            parent.id = "popupContainer";
            Blaze.renderWithData(Template.editPopup, selectedQuest, parent);

            var markerWithOpenPopUp = markerLayer.getLayer(Session.get('markerWithOpenPopUpId'));
            markerWithOpenPopUp._popup.setContent(parent);
        },

        'click .annehmen'(event) {
            var openQuestId = Session.get('openQuestId');
            Meteor.call('quests.take', openQuestId, "bearbeitung");
            console.log("Quest (" + openQuestId + ") angenommen");
        },
    });