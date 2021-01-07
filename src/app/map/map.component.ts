import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { circle, latLng, marker, polygon, tileLayer } from 'leaflet';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: latLng(-29.49944444, -52.51527778)
  };

  teste = "bacia1"

  layers = [
    circle([-29.49944444, -52.51527778], {
      radius: 5000,
      color: "blue",
      fillOpacity: 0.1
    }).bindPopup(
      '<label><b>Nome:</b> ' + 'Barros Cassal</label><br>' +
      '<b><label> Última coleta: </b>' + '2009' + '<br>' +
      '<label><b>Alcalinidade de bicarbonatos:</b> ' + '22,40' + ' (CaCO3) ' + '</label><br>' +
      '<label><b>Alcalinidade de bicarbonatos:</b> ' + '<0,1' + ' (CaCO3) ' + '</label>' +
      '<label><b>Alcalinidade de bicarbonatos:</b> ' + '<0,1' + ' mg/L ' + '</label>' 
    ),
    // polygon([[ 46.8, -121.85 ], [ 46.92, -121.92 ], [ 46.87, -121.8 ]]),
    // marker([ -29.49944444, -52.51527778 ], {

    // })
  ];

  pointMouseover(leafletEvent: any): any {
    console.log(leafletEvent);
    var layer = leafletEvent.target;

    layer.setStyle({
      weight: 2,
      color: '#666',
      fillColor: 'white'
    });
  }

  constructor() { }

  ngOnInit(): void {
  }

}
