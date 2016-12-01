import { Template } from 'meteor/templating';
import { Markers } from '../api/markers.js';

import './map.html';

Template.map.rendered = function() {
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images/';

  map = L.map('map').setView([52.504, 13.422], 10);
  var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: '',
      maxZoom: 18,
      id: 'leon4037.0bo1i1h7',
      accessToken: 'pk.eyJ1IjoibGVvbjQwMzciLCJhIjoiY2lwODdrNWV5MDAzMHV0bm1oamxjejcyaCJ9.oQomGba208ZZcnOslt3D3g'
  }).addTo(map);
};

Template.map.events({
  'click'(event) {
        var markers = Markers.find({}).fetch();
        if (Markers.find({}).count() == 0){
            console.log("Empty, filling Mongo DB");
            Markers.insert({
                location: [52.456951, 13.526402], 
                description: "<b>HTW Berlin</b><br>Campus Wilhelminenhof Gebäude C<br>Koordinaten: 52.456951, 13.526402"
            });
            Markers.insert({
                location: [52.506322, 13.443618], 
                description: "<b>Mercedes Benz Arena</b><br>Spielort von Alba Berlin & Eisbären Berlin<br>Koordinaten: 52.506322, 13.443618"
            });
            Markers.insert({
                location: [52.507968, 13.337746], 
                description: "<b>Zoologischer Garten</b><br>Hardenbergplatz 15, 10623 Berlin, Deutschland<br>Koordinaten: 52.507968, 13.337746"
            });
            console.log("Filled Mongo DB");
            console.log(Markers.find({}).count());
        }
        else {
            console.log("Found entities!!!!!!!!!!!!");
            markers.forEach(function(marker){
              var newMarker = L.marker(marker.location).bindPopup(marker.description).addTo(map);
            });
        }
  },
});