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


            setTimeout(function(){
                console.log(fileId);
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
                    imageId: fileId
                };

                Meteor.call('quests.insert', newQuest);

                map.closePopup();
                console.log("Quest created!");
            }, 2000);
        },

        'change #myFileInput': function(event) {

                var files = event.target.files; // FileList object

                // Loop through the FileList and render image files as thumbnails.
                for (var i = 0, f; f = files[i]; i++) {

                // Only process image files.
                if (!f.type.match('image.*')) {
                    continue;
                }

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                    // Render thumbnail.
                    var span = document.createElement('span');

                    var placeholder = document.getElementById('img');
                    placeholder.src = e.target.result;
                    // placeholder.style.display='none';

                    // span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    //                     '" title="', escape(theFile.name), '"/>'].join('');
                    // document.getElementById('list').insertBefore(span, null);
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
                }
        },

});
