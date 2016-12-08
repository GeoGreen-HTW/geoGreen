import { Mongo } from 'meteor/mongo';
 
export const Markers = new Mongo.Collection('markers');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('markers', function markersPublication() {
    return Markers.find();
  });
}