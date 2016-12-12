import { Template } from 'meteor/templating';
import { Markers } from '../api/markers.js';

import './map.html';

var markerLayer = L.layerGroup([]);

var greenIcon = L.icon({
    iconUrl: '/images/cursor_green.png',
    shadowUrl: '/images/cursor_shadow_small.png',

    iconSize:     [21, 59], // size of the icon
    shadowSize:   [46, 33], // size of the shadow
    iconAnchor:   [10, 59], // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 33],  // the same for the shadow
});

function onLocationFound(e) {
    L.marker(e.latlng, {icon: greenIcon}).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

Template.map.rendered = function() {
    initMap();
    Meteor.subscribe("markers", {
    onReady: function () { 
        console.log("Subscription is ready! Current count of collection is: "+ Markers.find().count());
        updateMapWithCollectionData();
    },
    onError: function () { console.log("onError", arguments); }
    });

	map.on('locationfound', onLocationFound);

    map.locate({setView: true, maxZoom: 19});

};

function initMap(){
    L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images/';

    map = L.map('map').setView([52.504, 13.422], 10);
    var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: '',
        maxZoom: 18,
        id: 'leon4037.0bo1i1h7',
        accessToken: 'pk.eyJ1IjoibGVvbjQwMzciLCJhIjoiY2lwODdrNWV5MDAzMHV0bm1oamxjejcyaCJ9.oQomGba208ZZcnOslt3D3g'
    }).addTo(map);
}

function updateMapWithCollectionData(){
    markerLayer.clearLayers(); // delete all existing markers
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
    createMarkersOfCollectionEntities();
}

function createMarkersOfCollectionEntities(){
    var markers = Markers.find({}).fetch();
    console.log("Collection isn't empty! Adding " + Markers.find({}).count() + " entities to map...");
    markers.forEach(function(marker){
        var newMarker = L.marker(marker.location, {riseOnHover: true}).bindPopup(marker.description).addTo(markerLayer); // add new marker object for each marker entity in "Markers" collection
    });
    markerLayer.addTo(map); // add layer with added markers to map
}