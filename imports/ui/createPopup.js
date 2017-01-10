  import './createPopup.html';
  import { Session } from 'meteor/session';

  
  Template.createPopup.helpers({
    current_pos: function () {
        return Session.get("m_lat") + "," +  Session.get("m_long");
    }
  });
  
    Template.createPopup.events({
    'click .edit': function(event){
        // ...
    } 
    });