import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as geolib from 'geolib';
import { EMPTY, forkJoin, from, Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import type * as initSqlJsTypes from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as utmObj from 'utm-latlng';
import { Data } from './models/data.models';

initSqlJs = (window as any).initSqlJs as typeof initSqlJsTypes;

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private readonly utm = new utmObj();

  private sql$: Observable<SqlJs.SqlJsStatic>;
  private db$: Observable<SqlJs.Database>;

  constructor(private http: HttpClient) {
    this.sql$ = from(
      initSqlJs({
        // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
        // You can omit locateFile completely when running in node
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      })
    ).pipe(shareReplay());

    const DB_URL = window.location.href + '/assets/database.sqlite';

    this.db$ = forkJoin({
      sqlite: this.http.get(DB_URL, { responseType: 'arraybuffer' }),
      sqljs: this.sql$,
    }).pipe(
      map(({ sqlite, sqljs }) => new sqljs.Database(new Uint8Array(sqlite))),
      shareReplay(),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );
  }

  runSql(sql: string) {
    return this.db$.pipe(map((bd) => bd.exec(sql)));
  }

  convertLat(lat: any) {
    const sanitized = !isNaN(+lat!)
      ? +lat!
      : (lat as string).replace(
          / *(\d+).+?(\d+).+?(\d+)(\.|,(\d+))?.+/g,
          '$1°$2\'$3.$50"S'
        );

    const res = geolib.toDecimal(sanitized);
    // console.log('LAT', lat, sanitized, res);
    return res;
  }

  convertLon(lon: any) {
    const sanitized = !isNaN(+lon!)
      ? +lon!
      : (lon as string).replace(
          / *(\d+).+?(\d+).+?(\d+)(\.|,(\d+))?.+/g,
          '$1°$2\'$3.$50"O'
        );

    const res = geolib.toDecimal(sanitized);
    // console.log('LON', lon, sanitized, res);
    return res;
  }

  utmToLatLon(n: SqlJs.ValueType, e: SqlJs.ValueType) {
    let aa = this.utm.convertUtmToLatLng(+e!, +n!, 22, 'J');
    if (aa.lat < -180) aa = this.utm.convertUtmToLatLng(+e!, +n!, 21, 'J');
    const { lat, lgn } = aa;
    return { lat: +lat, lgn: +lgn };
  }

  getDados(): Observable<Array<Data>> {
    return this.runSql(
      'SELECT * FROM dados_coletados WHERE longitude_o AND latitude_s !=  "" OR coordenadas_utm_e AND coordenadas_utm_n !=  ""'
    ).pipe(
      map((a) => {
        // MAGIA NEGRA DO JS
        const obj = a.map((table) =>
          table.values.map((row) =>
            table.columns
              .map((colName, idx) => ({ [colName]: row[idx] }))
              .reduce((acc, cur) => ({ ...acc, ...cur }), {})
          )
        )[0];

        const arrayJson = [];
        let first = true;
        let notEnd = false;
        let j = 0;

        for (let i = 0; i < obj.length; i++) {
          if (i !== obj.length - 1) {
            if (
              obj[i]['identificacao_corpo_hidrico'] ===
                obj[i + 1]['identificacao_corpo_hidrico'] &&
              obj[i]['bacia'] === obj[i + 1]['bacia'] &&
              obj[i]['municipio'] === obj[i + 1]['municipio'] &&
              obj[i]['latitude_s'] === obj[i + 1]['latitude_s'] &&
              obj[i]['longitude_o'] === obj[i + 1]['longitude_o'] &&
              obj[i]['coordenadas_utm_e'] === obj[i + 1]['coordenadas_utm_e'] &&
              obj[i]['coordenadas_utm_n'] === obj[i + 1]['coordenadas_utm_n'] &&
              obj[i]['data_coleta'] === obj[i + 1]['data_coleta'] &&
              first
            ) {
              arrayJson.push({
                bacia: obj[i]['bacia'],
                municipio: obj[i]['municipio'],
                lat:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLat(obj[i]['latitude_s'])
                    : null,
                long:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLon(obj[i]['longitude_o'])
                    : null,
                update: obj[i]['data_coleta'],
                altitude: obj[i]['altitude_m'],
                data: [
                  {
                    parametro_conforme_artigo:
                      obj[i]['parametro_conforme_artigo'],
                    valor: obj[i]['valor'],
                    unidade: obj[i]['unidade'],
                  },
                ],
              });
              j++;
              first = false;
              notEnd = true;
            } else if (
              obj[i]['identificacao_corpo_hidrico'] ===
                obj[i + 1]['identificacao_corpo_hidrico'] &&
              obj[i]['bacia'] === obj[i + 1]['bacia'] &&
              obj[i]['municipio'] === obj[i + 1]['municipio'] &&
              obj[i]['latitude_s'] === obj[i + 1]['latitude_s'] &&
              obj[i]['longitude_o'] === obj[i + 1]['longitude_o'] &&
              obj[i]['coordenadas_utm_e'] === obj[i + 1]['coordenadas_utm_e'] &&
              obj[i]['coordenadas_utm_n'] === obj[i + 1]['coordenadas_utm_n'] &&
              obj[i]['data_coleta'] === obj[i + 1]['data_coleta'] &&
              !first
            ) {
              arrayJson[j - 1].data.push({
                parametro_conforme_artigo: obj[i]['parametro_conforme_artigo'],
                valor: obj[i]['valor'],
                unidade: obj[i]['unidade'],
              });
            } else {
              arrayJson[j - 1].data.push({
                parametro_conforme_artigo: obj[i]['parametro_conforme_artigo'],
                valor: obj[i]['valor'],
                unidade: obj[i]['unidade'],
              });
              notEnd = false;
              first = true;
            }
          } else {
            if (
              obj[i]['identificacao_corpo_hidrico'] ===
                obj[i - 1]['identificacao_corpo_hidrico'] &&
              obj[i]['bacia'] === obj[i - 1]['bacia'] &&
              obj[i]['municipio'] === obj[i - 1]['municipio'] &&
              obj[i]['latitude_s'] === obj[i - 1]['latitude_s'] &&
              obj[i]['longitude_o'] === obj[i - 1]['longitude_o'] &&
              obj[i]['coordenadas_utm_e'] === obj[i - 1]['coordenadas_utm_e'] &&
              obj[i]['coordenadas_utm_n'] === obj[i - 1]['coordenadas_utm_n'] &&
              obj[i]['data_coleta'] === obj[i - 1]['data_coleta']
            ) {
              arrayJson[j - 1].data.push({
                parametro_conforme_artigo: obj[i]['parametro_conforme_artigo'],
                valor: obj[i]['valor'],
                unidade: obj[i]['unidade'],
              });
            } else {
              arrayJson.push({
                bacia: obj[i]['bacia'],
                municipio: obj[i]['municipio'],
                lat:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLat(obj[i]['latitude_s'])
                    : null,
                long:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLon(obj[i]['longitude_o'])
                    : null,
                update: obj[i]['data_coleta'],
                altitude: obj[i]['altitude_m'],
                data: [
                  {
                    parametro_conforme_artigo:
                      obj[i]['parametro_conforme_artigo'],
                    valor: obj[i]['valor'],
                    unidade: obj[i]['unidade'],
                  },
                ],
              });
            }
          }
        }
        return arrayJson;
        // console.log(arrayJson);
        // console.log(obj);
      })
    );
  }
}
