  import './createPopup.html';
  import { Session } from 'meteor/session';

  
  Template.createPopup.helpers({
    current_pos: function () {
        return Session.get("m_lat") + "," +  Session.get("m_long");
    }
  });
  
    Template.createPopup.events({
        'submit .createForm'(event) {
            // Prevent default browser form submit
            event.preventDefault();

            var newQuest = { 
                location: [m_lat, m_long], 
                title : document.getElementById('title').value,
                description:document.getElementById('Beschreibung').value,
                imgpfad:document.getElementById('img').src,
                Priorität:document.getElementById('prio').value,
                Arbeitsaufwand:document.getElementById('arbeitsaufwand').value,
                Zeiteinheit:document.getElementById('zeiteinheit').value,
                Status: "offen",
                Kategorie: document.getElementById('Kategorie').value,
                Kosten:document.getElementById('kosten').value,
            };

            Meteor.call('quests.insert', newQuest);

            map.closePopup();
            console.log("Quest created!");
        },
    });