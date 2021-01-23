import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
export class MapComponent implements OnInit {
  data: Array<Data> = [];

  readonly options: L.MapOptions = {
    zoom: 7,
    center: [-30, -53],
  };

  readonly layers: L.Layer[] = [
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),
  ];

  readonly defaultIconSettings = new L.Icon.Default({
    imagePath: 'leaflet/',
    shadowSize: [12, 10],
  });

  constructor(
    private dbService: DatabaseService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dbService.getDados().subscribe((data) => {
      this.data = data;
      this.addCircles();
    });
  }

  addCircles() {
    const markers = this.data
      .filter((e: Data) => e.lat && e.long)
      .map((e: Data) =>
        L.marker([+e.lat!, +e.long!], {
          icon: this.defaultIconSettings,
        }).bindPopup(
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
        )
      );

    this.layers?.push(...markers);
    this.cdRef.markForCheck();
  }

  onMapReady(map: L.Map) {
    this.http
      .get('assets/bacias_simple.json')
      .subscribe((baciasGeoJson: any) => {
        const bacias = L.geoJSON(baciasGeoJson, {
          style: {
            color: 'blue',
          },
        });

        this.layers?.push(bacias);
        this.cdRef.markForCheck();
      });
  }
}
