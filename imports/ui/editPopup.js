  import './editPopup.html';
  import { Quests } from '../api/quests.js';
  import { Session } from 'meteor/session';

  
  Template.editPopup.helpers({
    // quest: function () {
    //     var questId = Session.get('m_id');
    //     var selectedQuest = Quests.findOne({ _id: questId  });
    //     return selectedQuest;
    // }
  });

    Template.editPopup.events({
        'submit .popUpForm'(event) {
            // Prevent default browser form submit
            event.preventDefault();

            document.getElementById("state").disabled = true;
            // document.getElementById("bearbeiten").value = "Bearbeiten";


            //Update Datenbank
            var status = document.getElementById("state").value;
            var tit = document.getElementById("edit_title").value;
            var des = document.getElementById('edit_beschreibung').value;
            var pr = document.getElementById('edit_prio').value;
            var aw =  document.getElementById('edit_aufwand').value;
            var ze = document.getElementById('edit_zeit').value;
            var k = document.getElementById('edit_kosten').value;
            
            var questId = Session.get('openQuestId');
            Meteor.call("quests.update", questId, status, tit, des, pr, aw, ze, k);
        },

        'click .annehmen'(event) {
          var openQuestId = Session.get('openQuestId');
          Meteor.call('quests.take', openQuestId, "bearbeitung");
          console.log("Quest (" + openQuestId + ") angenommen");
        },
    });