import { Template } from 'meteor/templating';
import { Quests } from '../api/quests.js';

import './map.html';

var markerLayer = L.layerGroup([]);

var customControl =  L.Control.extend({

  options: {
    position: 'topleft'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

    container.style.backgroundColor = 'white';     
    container.style.backgroundImage = "url(/images/locate.png)";
    container.style.backgroundSize = "30px 30px";
    container.style.width = '30px';
    container.style.height = '30px';

    container.onclick = function(){
        map.locate({setView: true, maxZoom: 19});
    }

    return container;
  }
});

var greenIcon = L.icon({
    iconUrl: '/images/cursor_green.png',
    shadowUrl: '/images/cursor_shadow_small.png',

    iconSize:     [21, 59], // size of the icon
    shadowSize:   [46, 33], // size of the shadow
    iconAnchor:   [10, 59], // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 33],  // the same for the shadow
});

var locationMarker;

function onLocationFound(e) {
    if (locationMarker == null){
        locationMarker = L.marker(e.latlng, {icon: greenIcon});
        locationMarker.addTo(map);
    }
    else {
        locationMarker.setLatLng(e.latlng).update();
    }
}

function onLocationError(e) {
    alert(e.message);
}

 genQuest = function() {
    Quests.insert({ 
    location: [m_lat, m_long], 
    title : document.getElementById('title').value,
    description:document.getElementById('Beschreibung').value,
    imgpfad:document.getElementById('img').src,
    Priorität:document.getElementById('prio').value,
    Arbeitsaufwand:document.getElementById('arbeitsaufwand').value,
    Zeiteinheit:document.getElementById('zeiteinheit').value,
    Kosten:document.getElementById('kosten').value});

    map.closePopup();
    return false;
}

Template.map.rendered = function() {
    initMap();
    Meteor.subscribe("quests", {
    onReady: function () { 
        console.log("Subscription is ready! Current count of collection is: "+ Quests.find().count());

        Quests.find().observeChanges({
            added: function (id, fields) {
                console.log("NEW QUEST");
                createMarkerForNewQuest(fields);
            },
            changed: function (id, fields) {
                console.log("CHANGED QUEST");
            },
            removed: function (id) {
                console.log("REMOVED QUEST");
            }
        });
    },
    onError: function () { console.log("onError", arguments); }
    });

	map.on('locationfound', onLocationFound);

    map.locate({setView: true, watch: true,  maxZoom: 19});

    map.on('dblclick', function(event)
    {
        m_long = event.latlng.lng;
        m_lat = event.latlng.lat;
        var current_pos = event.latlng.lat +','+event.latlng.lng;
        var list = "<form action='return genQuest()' method='POST'>"+
        "<label for='Aktuelle Position'> Aktuelle Position: </label>"+
        "<label>"+ current_pos+"</label></br>"+
        "<label for='Titel'>Titel:</label>"+
        "<input type='text' name='title' id='title' placeholder='Titel' required autofocus /><br>"+
        "<img id='img' src='/images/bild_hochladen.gif' onclick='return uploadImg()'></img>"+
        "<label for='Beschreibung'>Beschreibung:</label>"+
        "<input type='text' name='Beschreibung' id='Beschreibung' placeholder='Beschreibung' required/><br>"+
        "<label for='Prioritaet'>Priorität:</label>"+
        "<select name='prio' id='prio'>"+
			"<option value='Dringend'>Dringend</option>"+
			"<option value='Hoch'>Hoch</option>"+
			"<option value='Normal'>Normal</option>"+
			"<option value='Niedrig'>Niedrig</option>"+
		"</select></br>"+
        "<label for='Aufwand'>Arbeitsaufwand:</label>"+
        "<input type='text' name='arbeitsaufwand' id='arbeitsaufwand' placeholder='Arbeitsaufwand' ><select name='aufwandzeiteinheit' id='zeiteinheit'>"+
			"<option value='Stunden'>Stunden</option>"+
			"<option value='Tag'>Tage</option>"+
			"<option value='Monat'>Monate</option>"+
			"<option value='Jahr'>Jahre</option>"+
		"</select></br>"+
        "<label for='Kosten'>Kosten in Euro:</label>"+
        "<input type='text' name='kosten' id='kosten' placeholder='Kosten in Euro'/><br>"+
        "<button onclick='return genQuest()'>Erstellen</button>" +
        "</form>";

        var popup = L.popup();
        popup.setLatLng(event.latlng).setContent(list).openOn(map);
        
    });

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
    map.addControl(new customControl());
}

function updateMapWithCollectionData(){
    markerLayer.clearLayers(); // delete all existing markers
    if (Quests.find({}).count() == 0){
        console.log("Empty, filling Mongo DB");
        Quests.insert({
            location: [52.456951, 13.526402], 
            description: "<b>HTW Berlin</b><br>Campus Wilhelminenhof Gebäude C<br>Koordinaten: 52.456951, 13.526402"
        });
        Quests.insert({
            location: [52.506322, 13.443618], 
            description: "<b>Mercedes Benz Arena</b><br>Spielort von Alba Berlin & Eisbären Berlin<br>Koordinaten: 52.506322, 13.443618"
        });
        Quests.insert({
            location: [52.507968, 13.337746], 
            description: "<b>Zoologischer Garten</b><br>Hardenbergplatz 15, 10623 Berlin, Deutschland<br>Koordinaten: 52.507968, 13.337746"
        });
        console.log("Filled Mongo DB");
        console.log(Quests.find({}).count());
    }
    createMarkersOfCollectionEntities();
}


function createMarkerForNewQuest(fields){
    var newMarker = L.marker(fields.location, {riseOnHover: true}).bindPopup(fields.description).addTo(markerLayer); // add new marker object for each marker entity in "Quests" collection
    markerLayer.addTo(map); // add layer with added markers to map
}

// Account 
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

