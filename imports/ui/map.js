import { Template } from 'meteor/templating';
import { Quests } from '../api/quests.js';

import './map.html';

var markerLayer = L.layerGroup([]);
var m_fields,m_id;
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
    Status: "offen",
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
                createMarkerForNewQuest(id,fields);
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
        "<table>"+
            "<tr>"+
                "<th><label for='Aktuelle Position'> Aktuelle Position:</label></th>"+
                "<td><label>"+ current_pos+"</label></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label for='Titel'>Titel:</label></th>"+
                "<td><input type='text' name='title' id='title' placeholder='Titel' required autofocus /><td>"+
            "</tr>"+
        "</table>"+
        "<img id='img' src='/images/bild_hochladen.gif' onclick='return uploadImg()'></img>"+
        "<table>"+
            "<tr>"+
                "<th><label for='Beschreibung'>Beschreibung:</label></th>"+
                "<td><input type='text' name='Beschreibung' id='Beschreibung' placeholder='Beschreibung' required/></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label for='Prioritaet'>Priorität:</label></th>"+
                    "<td><select name='prio' id='prio'>"+
                        "<option value='Dringend'>Dringend</option>"+
                        "<option value='Hoch'>Hoch</option>"+
                        "<option value='Normal'>Normal</option>"+
                        "<option value='Niedrig'>Niedrig</option>"+
                    "</select></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label for='Aufwand'>Arbeitsaufwand:</label></th>"+
                "<td><input type='text' name='arbeitsaufwand' id='arbeitsaufwand' placeholder='Arbeitsaufwand' ><select name='aufwandzeiteinheit' id='zeiteinheit'>"+
                    "<option value='Stunden'>Stunden</option>"+
                    "<option value='Tag'>Tage</option>"+
                    "<option value='Monat'>Monate</option>"+
                    "<option value='Jahr'>Jahre</option>"+
                "</select></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label for='Kosten'>Kosten in Euro:</label></th>"+
                "<td><input type='text' name='kosten' id='kosten' placeholder='Kosten in Euro'/><td>"+
            "</tr>"+
            "<tr>"+
                "<td><button onclick='return genQuest()'>Erstellen</button></td>" +
            "</tr>"+
        "</table>"+
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


function createMarkerForNewQuest(id,fields){
    m_fields = fields;
    m_id = id;
     var list = "<form method='GET'>"+
        "<center><big><label id='db_title' >"+fields.title+"</label></big></center>"+
        "<table>"+
            "<tr>"+
                "<th><label for='Aktuelle Position'> Aktuelle Position:</label></th>"+
                "<td><label>"+ fields.location+"</label></td>"+
            "</tr>"+
        "</table>"+
        "<img id='img' src='"+ fields.imgpfad+"'></img><br>"+
        "<table>"+
            "<tr>"+
                "<th><label>Beschreibung:</label></th>"+
                "<td><label for='Beschreibung' id='db_beschreibung'>"+fields.description+"</label></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label>Priorität:</label></th>"+
                "<td><label for='Prioritaet' id='db_prio'>"+fields.Priorität+"</label></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label>Arbeitsaufwand:</label></th>"+
                "<td><label for='Aufwand' id='db_aufwand'>"+fields.Arbeitsaufwand +"</label><label id='db_zeiteinheit'> "+ fields.Zeiteinheit+"</label></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label>Kosten in Euro</label></th>"+
                "<td><label for='Kosten' id='db_kosten'>"+fields.Kosten+"</label></td>"+
            "</tr>"+
            "<tr>"+
                "<th><label>Status:</label></th>"+
                "<td>"+
                "<select disabled name='state' id='state'>"+
                    "<option value='offen'>Offen</option>"+
                    "<option value='bearbeitung'>In Bearbeitung</option>"+
                    "<option value='erledigt'>Erledigt</option>"+
                "</select></td>"+
            "</tr>"+
            "<tr>"+
                "<td><input value='Bearbeiten' id='bearbeiten' type='submit' onclick='return conQuest()'></input></td>" +
            "</tr>"+
        "<table>"+
        "</form>";
    var newMarker = L.marker(fields.location, {riseOnHover: true}).bindPopup(list).addTo(markerLayer); // add new marker object for each marker entity in "Quests" collection
    markerLayer.addTo(map); // add layer with added markers to map

}


 conQuest = function() {
     
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

         //Labels erstellen

         //Titel
         var title_label = document.createElement("label");
         title_label.setAttribute("id","db_title");
         title_label.innerHTML =document.getElementById("edit_title").value;
         
         var _title = document.getElementById("edit_title");
         var parenttitle = _title.parentNode;
         parenttitle.replaceChild(title_label,_title);

         //Beschreibung
         var beschreibung_label = document.createElement("label");
         beschreibung_label.setAttribute("id","db_beschreibung");
         beschreibung_label.innerHTML =document.getElementById("edit_beschreibung").value;
         var _beschreibung = document.getElementById("edit_beschreibung");
         var parentbeschreibung = _beschreibung.parentNode;
         parentbeschreibung.replaceChild(beschreibung_label,_beschreibung);

         //Priorität
         var prio_label = document.createElement("label");
         prio_label.setAttribute("id","db_prio");
         prio_label.innerHTML =document.getElementById("edit_prio").value;
         var _prio = document.getElementById("edit_prio");
         var parentprio = _prio.parentNode;
         parentprio.replaceChild(prio_label,_prio);
         
         //Aufwand
         var aufwand_label = document.createElement("label");
         aufwand_label.setAttribute("id","db_aufwand");
         aufwand_label.innerHTML =document.getElementById("edit_aufwand").value;
         var _aufwand = document.getElementById("edit_aufwand");
         var parentaufwand = _aufwand.parentNode;
         parentaufwand.replaceChild(aufwand_label,_aufwand);

         //Zeiteinheit
         var zeit_label = document.createElement("label");
         zeit_label.setAttribute("id","db_zeiteinheit");
         zeit_label.innerHTML =document.getElementById("edit_zeit").value;
         var _zeit = document.getElementById("edit_zeit");
         var parentzeit = _zeit.parentNode;
         parentzeit.replaceChild(zeit_label,_zeit);

         //Kosten
         var kosten_label = document.createElement("label");
         kosten_label.setAttribute("id","db_kosten");
         kosten_label.innerHTML =document.getElementById("edit_kosten").value;
         var _kosten = document.getElementById("edit_kosten");
         var parentkosten = _kosten.parentNode;
         parentkosten.replaceChild(kosten_label,_kosten);

         //Update Datenbank
         var status = document.getElementById("state").value;
         var tit = document.getElementById("db_title").innerHTML;
         var des = document.getElementById('db_beschreibung').innerHTML;
         var pr = document.getElementById('db_prio').innerHTML;
         var aw =  document.getElementById('db_aufwand').innerHTML;
         var ze = document.getElementById('db_zeiteinheit').innerHTML;
         var k = document.getElementById('db_kosten').innerHTML;
         var newQ = Quests.findOne({ location: m_fields.location });
         Quests.update({_id : newQ._id},{$set:{Status : status, _title: tit,
         _description:des,
         _Priorität:pr,
         _Arbeitsaufwand:aw,
         _Zeiteinheit:ze,
         _Kosten:k}});
     }
     //
    return false;
}
