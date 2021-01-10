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


  layers = [
    circle([-29.49944444, -52.51527778], {
      radius: 5000,
      color: "blue",
      fillOpacity: 0.1
    }).bindPopup(
      '<label><b>Nome:</b> ' + 'Barros Cassal</label><br>' +
      '<b><label> Última coleta: </b>' + '2009' + '<br>' +
      '<label><b>Alcalinidade de bicarbonatos:</b> ' + '22,40' + ' (CaCO3) ' + '</label><br>' +
      '<label><b>Alcalinidade de bicarbonatos:</b> ' + '<0,1' + ' (CaCO3) ' + '</label><br>' +
      '<label><b>Alcalinidade de bicarbonatos:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Alcalinidade total:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Alumínio:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Cálcio:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Coliformes termotolerantes:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Coliformes totais:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Cloro residual livre:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Condutividade elétrica:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Ferro:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Fluoreto:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Magnésio:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Manganês:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Matéria orgânica:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Nitrato:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Nitrogênio amoniacal:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>pH:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Potássio:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Salinidade:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Sólidos dissolvidos totais:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Sódio:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Sulfato:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' +
      '<label><b>Turbidez:</b> ' + '<0,1' + ' mg/L ' + '</label><br>' 
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
