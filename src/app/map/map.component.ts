import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { DbService } from '../db.service';
import * as L from "leaflet";
import { Data } from "../models/data.models";
import { DatabaseService } from '../database.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit, AfterViewInit {

  private map: any;
  json: any;

  data: Array<Data> = [];

  constructor(
    private dbService: DatabaseService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.dbService.getDados().subscribe((data) => {
      this.data = data;
      // console.log(data[0]);
      this.addCircles();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.onMapReady();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-30, -53],
      zoom: 7
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  addCircles() {
    this.data.map((e: Data) => {
      L.circle([+!e.lat, +!e.long], {
        radius: 5000,
        color: "blue",
        fillOpacity: 0.1
      }).addTo(this.map).bindPopup(
        '<label><b>Nome:</b> ' + e.bacia + '</label><br>' +
        '<b><label> Última coleta: </b>' + e.update + '<br>' +
        e.data.map((i) => {
          return '<br><label><b>' + i.parametro_conforme_artigo + ': </b> ' + i.valor + ' ' + i.unidade + '</label>';
        })
      );
    });
  }

  onMapReady() {
    this.http.get('assets/bacias.json').subscribe((json: any) => {
      console.log(json);
      this.json = json;
      L.geoJSON(this.json).addTo(this.map);
    });
  }

}
