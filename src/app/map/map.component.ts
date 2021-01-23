import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import * as L from 'leaflet';
import { DatabaseService } from '../database.service';
import { Data } from '../models/data.models';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, AfterViewInit {
  private map: any;
  json: any;

  data: Array<Data> = [];

  constructor(private dbService: DatabaseService, private http: HttpClient) {}

  ngOnInit(): void {
    this.dbService.getDados().subscribe((data) => {
      this.data = data;
      console.log(data);
      this.addCircles();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-30, -53],
      zoom: 7,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
  }

  addCircles() {
    var icon = new L.Icon.Default({
      iconUrl: '',
      shadowUrl: '',
      shadowSize: [12, 10],
    });

    this.data.map((e: Data) => {
      if (e.lat && e.long) {
        L.marker([+e.lat, +e.long], { icon })
          .addTo(this.map)
          .bindPopup(
            '<label><b>Nome:</b> ' +
              e.bacia +
              '</label><br>' +
              '<b><label> Última coleta: </b>' +
              e.update +
              '<br>' +
              e.data.map((i) => {
                return (
                  '<br><label><b>' +
                  i.parametro_conforme_artigo +
                  ': </b> ' +
                  i.valor +
                  ' ' +
                  i.unidade +
                  '</label>'
                );
              })
          );
      }
    });
    this.onMapReady();
  }

  onMapReady() {
    this.http.get('assets/bacias.json').subscribe((json: any) => {
      this.json = json;
      L.geoJSON(this.json, {
        style: {
          color: 'blue',
        },
      }).addTo(this.map);
    });
  }
}
