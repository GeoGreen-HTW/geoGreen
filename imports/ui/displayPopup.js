  import './displayPopup.html';
  import { Quests } from '../api/quests.js';
  import { Session } from 'meteor/session';

  
  Template.displayPopup.helpers({
    isAssignee: function () {
        return this.assigneeId === Meteor.userId();
    },

    isTaken: function () {
		if (this.Status == "bearbeitung"){
            return true;
        }
        return false;
	},

	isOwner: function () {
		return this.owner.id === Meteor.userId();
	}
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

        'click .abmelden'(event) {
            var openQuestId = Session.get('openQuestId');
            Meteor.call('quests.cancel', openQuestId);
            console.log("Quest (" + openQuestId + ") abgemeldet");
        },
    });