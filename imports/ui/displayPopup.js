  import './displayPopup.html';
  import { Quests } from '../api/quests.js';
  import { Images } from '../api/images.js';
  import { Session } from 'meteor/session';


  Meteor.subscribe("images", {
      onReady: function () { 
        console.log("Subscription is ready! Current count of Images is: "+ Images.find().count());
    },
    onError: function () { console.log("onError", arguments); }
    
  });
  
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
	},

    image: function (){
        return Images.findOne({ _id: this.imageId });
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