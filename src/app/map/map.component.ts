import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
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

  @ViewChild('popupTemplate', { static: true })
  private popupTemplate?: TemplateRef<any>;
  private map?: L.Map;

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
    private cdRef: ChangeDetectorRef,
    private vcRef: ViewContainerRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.dbService.getDados().subscribe((data) => {
      this.data = data;
      this.addCircles();
    });
  }

  createTemplate(layer: L.Layer, data: Data): L.Content {
    return this.zone.run(() => {
      if (!this.popupTemplate) throw new Error('Popup template not found');

      const view = this.vcRef?.createEmbeddedView(this.popupTemplate, { data });
      const node = view?.rootNodes[0];

      const destroy = () => {
        view.destroy();
        layer.off('popupclose', destroy);
      };
      layer.on('popupclose', destroy);

      return node;
    });
  }

  addCircles() {
    const markers = this.data
      .filter((data: Data) => data.lat && data.long)
      .map((data: Data) =>
        L.marker([+data.lat!, +data.long!], {
          icon: this.defaultIconSettings,
        }).bindPopup((layer) => this.createTemplate(layer, data))
      );

    this.layers?.push(...markers);
    this.cdRef.markForCheck();
  }

  onMapReady(map: L.Map) {
    this.map = map;

    setTimeout(() => this.map?.invalidateSize(), 500);

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
