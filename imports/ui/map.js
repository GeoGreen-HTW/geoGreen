import { Template } from 'meteor/templating';
import { Quests } from '../api/quests.js';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import './createPopup.js';
import './editPopup.js';
import './displayPopup.js';
import './map.html';

markerLayer = L.layerGroup([]);
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
        var currentPosition = Session.get('currentPosition');
        console.log(currentPosition);
        map.setView(currentPosition, 19);
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
    Session.set('currentPosition', e.latlng);
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

Template.map.rendered = function() {
    initMap();
    Meteor.subscribe("quests", {
    onReady: function () { 
        console.log("Subscription is ready! Current count of collection is: "+ Quests.find().count());

        Quests.find().observeChanges({
            added: function (id, fields) {
                console.log("NEW QUEST");
                createMarkerForNewQuest(id,fields);
            },
            changed: function (id, fields) {
                console.log("CHANGED QUEST");
                updateQuestPopUpWithMongoDbData(id, fields);
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
        Session.set({ m_long: m_long , m_lat: m_lat});

        var parent = document.createElement("div");
        parent.id = "popupContainer";
        Blaze.render(Template.createPopup, parent);

        var popup = L.popup();
        popup.setLatLng(event.latlng).setContent(parent).openOn(map);
        
    });

    map.on('popupopen', function(e) {
        if (e.popup._source != undefined){
            Session.set("markerWithOpenPopUpId", e.popup._source._leaflet_id);
            Session.set("openQuestId", e.popup._source.questId);
        }
    });

    map.on('popupclose', function(e) {
            Session.set("markerWithOpenPopUpId", undefined);
            Session.set("openQuestId", undefined);
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

function updateQuestPopUpWithMongoDbData(id, fields){
        Session.set('m_id', id);

        var selectedQuest = Quests.findOne({ _id: id  });
        
        var parent = document.createElement("div");
        parent.id = "popupContainer";
        Blaze.renderWithData(Template.displayPopup, selectedQuest, parent);

        var markerWithOpenPopUp = markerLayer.getLayer(Session.get('markerWithOpenPopUpId'));
        markerWithOpenPopUp._popup.setContent(parent);
}


function createMarkerForNewQuest(id,fields){
    Session.set('m_id', id);

    var selectedQuest = Quests.findOne({ _id: id  });

    var parent = document.createElement("div");
    parent.id = "popupContainer";

    Blaze.renderWithData(Template.displayPopup, selectedQuest, parent);

    var newMarker = L.marker(fields.location, {riseOnHover: true}).bindPopup(parent).addTo(markerLayer); // add new marker object for each marker entity in "Quests" collection
    newMarker.questId = id;

    markerLayer.addTo(map); // add layer with added markers to map
}

// Account 
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});
