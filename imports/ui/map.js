import { Template } from 'meteor/templating';
import { Quests } from '../api/quests.js';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import './createPopup.js';
import './displayPopup.js';
import './map.html';

var markerLayer = L.layerGroup([]);
var m_fields, m_id;
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
        
        ///Summary Begin
        //Die jeweiligen Labels werden durch Inputs bzw. Select ersetzt.
        //Dadurch ist der Benutzer in der Lage, den Quest zu bearbeiten.
        ///Summary End
         document.getElementById("bearbeiten").value = "aktualisieren";
         document.getElementById("state").disabled = false;
         //Titel
         var title_input = document.createElement("input");
         title_input.setAttribute("id","edit_title");
         title_input.setAttribute("type","text");
         title_input.setAttribute("value",document.getElementById("db_title").innerHTML);
         title_input.required = true;
         var title_label = document.getElementById("db_title");
         var parentLabel = title_label.parentNode;
         parentLabel.replaceChild(title_input,title_label);

         //Beschreibung
         var beschreibung_input = document.createElement("input");
         beschreibung_input.setAttribute("id","edit_beschreibung");
         beschreibung_input.setAttribute("type","text");
         beschreibung_input.setAttribute("value",document.getElementById("db_beschreibung").innerHTML);
         beschreibung_input.required = true;
         var beschreibung_label = document.getElementById("db_beschreibung");
         var parentbeschreibung = beschreibung_label.parentNode;
         parentbeschreibung.replaceChild(beschreibung_input,beschreibung_label);

         //Prioritaet
         var Prioritaet_input = document.createElement("select");
         Prioritaet_input.setAttribute("id","edit_prio");
         Prioritaet_input.setAttribute("type","text");
         var option = document.createElement("option");
         option.text = "Dringend";
         Prioritaet_input.add(option);
         var option1 = document.createElement("option");
         option1.text = "Hoch";
         Prioritaet_input.add(option1);
         var option2 = document.createElement("option");
         option2.text = "Normal";
         Prioritaet_input.add(option2);
         var option3 = document.createElement("option");
         option3.text = "Niedrig";
         Prioritaet_input.add(option3);
         var prio_label = document.getElementById("db_prio");
         var parentprio = prio_label.parentNode;
         parentprio.replaceChild(Prioritaet_input,prio_label);

         //Aufwand
         var aufwand_input = document.createElement("input");
         aufwand_input.setAttribute("id","edit_aufwand");
         aufwand_input.setAttribute("type","text");
         aufwand_input.setAttribute("value",document.getElementById("db_aufwand").innerHTML);
         var aufwand_label = document.getElementById("db_aufwand");
         var parentaufwand = aufwand_label.parentNode;
         parentaufwand.replaceChild(aufwand_input,aufwand_label);

         //Zeiteinheit
         var zeit_input = document.createElement("select");
         zeit_input.setAttribute("id","edit_zeit");
         zeit_input.setAttribute("type","text");
         var option = document.createElement("option");
         option.text = "Stunden";
         zeit_input.add(option);
         var option1 = document.createElement("option");
         option1.text = "Monate";
         zeit_input.add(option1);
         var option2 = document.createElement("option");
         option2.text = "Jahre";
         zeit_input.add(option2);
         var zeit_label = document.getElementById("db_zeiteinheit");
         var parentzeit = zeit_label.parentNode;
         parentzeit.replaceChild(zeit_input,zeit_label);

         //Kosten
         var kosten_input = document.createElement("input");
         kosten_input.setAttribute("id","edit_kosten");
         kosten_input.setAttribute("type","text");
         kosten_input.setAttribute("value",document.getElementById("db_kosten").innerHTML);
         var kosten_label = document.getElementById("db_kosten");
         var parentkosten = kosten_label.parentNode;
         parentkosten.replaceChild(kosten_input,kosten_label);

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
