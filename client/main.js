import '../imports/ui/body.js';
import { Session } from 'meteor/session';

// on startup run resizing event
Meteor.startup(function() {
    Session.set('m_long', '');
    Session.set('m_lat', '');
    Session.set('m_id', '');
    Session.set('markerWithOpenPopUpId', undefined);
    Session.set('openQuestId', '');
    Session.set('markerLayer', undefined);
    Session.set('currentPosition', undefined);

  $(window).resize(function() {
    $('#map').css('height', window.innerHeight - 82 - 45);
  });
  $(window).resize(); // trigger resize event 
});

