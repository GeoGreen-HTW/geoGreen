import { Template } from 'meteor/templating';
import { Quests } from '../api/quests.js';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import './createPopup.js';
import './editPopup.js';
import './displayPopup.js';
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


Template.map.events({
  'submit .createForm'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    var newQuest = { 
        location: [m_lat, m_long], 
        title : document.getElementById('title').value,
        description:document.getElementById('Beschreibung').value,
        imgpfad:document.getElementById('img').src,
        Priorität:document.getElementById('prio').value,
        Arbeitsaufwand:document.getElementById('arbeitsaufwand').value,
        Zeiteinheit:document.getElementById('zeiteinheit').value,
        Status: "offen",
        Kosten:document.getElementById('kosten').value,
    };

    Meteor.call('quests.insert', newQuest);

    map.closePopup();
    console.log("Quest created!");
  },

  'submit .popUpForm'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    editQuest();
  },

  'click .annehmen'(event) {
    var openQuestId = Session.get('openQuestId');
    Meteor.call('quests.take', openQuestId, "bearbeitung");
    console.log("Quest (" + openQuestId + ") angenommen");
  },
});

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

        var newContent2 = Blaze.toHTML(Template.createPopup);

        var popup = L.popup();
        popup.setLatLng(event.latlng).setContent(newContent2).openOn(map);
        
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
        var content = Blaze.toHTML(Template.displayPopup);
        var state = document.getElementById('state');
        state.value = fields.Status;

        var markerWithOpenPopUp = markerLayer.getLayer(Session.get('markerWithOpenPopUpId'));
        markerWithOpenPopUp._popup.setContent(content);
}


function createMarkerForNewQuest(id,fields){
    Session.set('m_id', id);

    var content = Blaze.toHTML(Template.displayPopup);
    var newMarker = L.marker(fields.location, {riseOnHover: true}).bindPopup(content).addTo(markerLayer); // add new marker object for each marker entity in "Quests" collection
    newMarker.questId = id;

    markerLayer.addTo(map); // add layer with added markers to map
}


 editQuest = function() {
     console.log("CALLED METHOD");
     if(document.getElementById("bearbeiten").value == "Bearbeiten")
     {
        var questId = Session.get('m_id');
        var selectedQuest = Quests.findOne({ _id: questId  });

        var content = Blaze.toHTMLWithData(Template.editPopup, selectedQuest);

        var markerWithOpenPopUp = markerLayer.getLayer(Session.get('markerWithOpenPopUpId'));
        markerWithOpenPopUp._popup.setContent(content);
        document.getElementById("edit_prio").value = selectedQuest.Priorität;
        document.getElementById("edit_zeit").value = selectedQuest.Zeiteinheit;
        document.getElementById("state").value = selectedQuest.Status;
        document.getElementById("state").disabled = true;
     }
     else
     {
         ///Summary Begin
         // Die vom Nutzer bearbeiteten Elemente werden in Labels umgewandelt und in die Datenbank aktualisiert.
         ///Summary End

         //Button aktualisieren -> Zurück  zu bearbeiten
         document.getElementById("state").disabled = true;
         document.getElementById("bearbeiten").value = "Bearbeiten";


         //Update Datenbank
         var status = document.getElementById("state").value;
         var tit = document.getElementById("edit_title").value;
         var des = document.getElementById('edit_beschreibung').value;
         var pr = document.getElementById('edit_prio').value;
         var aw =  document.getElementById('edit_aufwand').value;
         var ze = document.getElementById('edit_zeit').value;
         var k = document.getElementById('edit_kosten').value;
         
         var questId = Session.get('openQuestId');
         Meteor.call("quests.update", questId, status, tit, des, pr, aw, ze, k);
     }
     //
    return false;
}

// Account 
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});
