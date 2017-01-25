import { Quests } from '../imports/api/quests.js';
//import { Accounts } from 'meteor/accounts-base';
  import { Session } from 'meteor/session';
 
 
var assert  = require('chai').assert;
var questId;
var questId2;
var UpdatedQuest;
var CurrentQuest;
 
//Update Datenbank
var status =  'offen';
var tit =     '9999';
var des =     '9999';
var pr =      'Hoch';
var aw =      '9999';
var ze =      'Monate';
var k =       '9999';
 
describe('test-Edit-Test', function()
{
    if (Meteor.isClient)
    {
        //it('Register Testaccount', funciton(callback));
        //{
        //    var accountid= Accounts.createUser({
        //                username: 'user2',
        //                email: 'user2@test.com',
        //                password: '123456'});
        //    assert.isNotNull(accountid);
        //     callback();
        //}
        it('Creating a Quest', function(callback)
        {       // First the user should be login on geogreen
                Meteor.loginWithPassword('user2@test.com','123456');
                var newQuest = {
                        location: ['52.456993325786826', '13.52644443511963'],
                        title : '1111',
                        description: '1111',
                        imgpfad: 'Test mit Mocha',
                        Priorität:'Dringend',
                        Arbeitsaufwand:'1111',
                        Zeiteinheit:'Stunden',
                        Status: 'offen',
                        Kosten:'1111',
                    };
                Meteor.call('quests.insert', newQuest);
                CurrentQuest = Quests.find({}, {"sort": [['_id','desc']]}).fetch();
                questId= CurrentQuest[0]._id;
 
                assert(questId!=0,'id vergeben');
                callback();
        });
 
       it('edit the quest',function(callback)
       {
           Meteor.loginWithPassword('user2@test.com','123456');
            Meteor.call('quests.update', questId, status, tit, des, pr, aw, ze, k);
            callback();
       });
       it('Quest update verifiziert',function(callback)
       {    //aendern
           Meteor.loginWithPassword('user2@test.com','123456');
          var UpdatedQuest = Quests.find({}, {"sort": [['_id','desc']]}).fetch();
 
           assert.equal(status, UpdatedQuest[0].Status,             "OK");//
           assert.equal(tit,    UpdatedQuest[0].title,              "OK");//
           assert.equal(des,    UpdatedQuest[0].description,        "OK");//
           assert.equal(pr,     UpdatedQuest[0].Priorität,          "OK");//
           assert.equal(aw,     UpdatedQuest[0].Arbeitsaufwand,     "OK");//
           assert.equal(ze,     UpdatedQuest[0].Zeiteinheit,        "OK");//
           assert.equal(k,      UpdatedQuest[0].Kosten,             "OK");//
 
            callback();
       } );
    }
// // Test on the Sever-site
    if (Meteor.isServer)
    {
            // Find User and check, if data was saved
       var user = Accounts.findUserByEmail("user2@test.com");
       // IT Module - User found
       it("UTest", function(callback)
       {
            callback();
       });
    }
});