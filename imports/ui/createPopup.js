  import './createPopup.html';
  import { Session } from 'meteor/session';
  import { Images } from '../api/images.js';

  
  Template.createPopup.helpers({
    current_pos: function () {
        return Session.get("m_lat") + "," +  Session.get("m_long");
    }
  });
  
    Template.createPopup.events({
        'submit .createForm'(event) {
            // Prevent default browser form submit
            event.preventDefault();
            
            var files = event.target.myFileInput.files;
            var fileId = "undefined";
            for (var i = 0, ln = files.length; i < ln; i++) {
            Images.insert(files[i], function (err, fileObj) {
                // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                console.log(fileObj._id);
                fileId = fileObj._id;
                console.log(new Date().getTime());
            });
            }
            console.log(new Date().getTime());
            var newQuest = { 
                location: [m_lat, m_long], 
                title : document.getElementById('title').value,
                description:document.getElementById('Beschreibung').value,
                imgpfad:document.getElementById('img').src,
                Priorität:document.getElementById('prio').value,
                Arbeitsaufwand:document.getElementById('arbeitsaufwand').value,
                Zeiteinheit:document.getElementById('zeiteinheit').value,
                Status: "offen",
                Kosten:document.getElementById('kosten').value,
                imageId: fileId
            };

            Meteor.call('quests.insert', newQuest);

            map.closePopup();
            console.log("Quest created!");
        },

        // 'change .myFileInput': function(event, template) {
        //     var files = event.target.files;
        //     for (var i = 0, ln = files.length; i < ln; i++) {
        //     Images.insert(files[i], function (err, fileObj) {
        //         // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        //     });
        //     }
        // },
    });