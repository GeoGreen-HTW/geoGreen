import { Quests } from '../imports/api/quests.js';
var assert  = require("chai").assert;

var questId;
var CurrentQuest;


describe("Creation of Quest", function() {
    if (Meteor.isClient){
        it("Creating a Quest", function(callback) {
                // First the user should be login on geogreen
                Meteor.loginWithPassword('testuser1@gmail.com','123456');         
                var newQuest = { 
                        location: ['52.456993325786826', '13.52644443511963'], 
                        title : 'Test mit Mocha',
                        description: 'Testing create quest function it mocha',
                        imgpfad: 'Test mit Mocha',
                        Priorität:'Dringend',
                        Arbeitsaufwand:2,
                        Zeiteinheit:'Stunden',
                        Status: "offen",
                        Kosten:'',
                    };
                Meteor.call('quests.insert', newQuest);
                CurrentQuest = Quests.find({}, {"sort": [['_id','desc']]}).fetch();
                questId = CurrentQuest[0]._id;
                assert.isNotNull(questId);    
                callback();
            
        });

      /*  it("Quest available in the DB", function(callback) {
            var selectedQuest = Quests.findOne({ _id: questId  });
            assert.equal(selectedQuest,questId); 
            callback();
        }); */
    }   
});