import { Location } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as geolib from 'geolib';
import { BehaviorSubject, EMPTY, forkJoin, from, Observable } from 'rxjs';
import { catchError, filter, map, shareReplay, tap } from 'rxjs/operators';
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

  readonly dbDownloadProgress$ = new BehaviorSubject(-1);

  constructor(private http: HttpClient, private location: Location) {
    this.sql$ = from(
      initSqlJs({
        // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
        // You can omit locateFile completely when running in node
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      })
    ).pipe(shareReplay());

    const dbFile = this.http
      .get('/assets/database.sqlite', {
        responseType: 'arraybuffer',
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        tap((evt) => {
          if (evt.type === HttpEventType.DownloadProgress)
            this.dbDownloadProgress$.next(
              evt.total ? evt.loaded / evt.total : 0
            );
        }),
        filter((evt) => evt.type === HttpEventType.Response),
        map((res) => (res as HttpResponse<ArrayBuffer>).body),
        tap(() => this.dbDownloadProgress$.next(1))
      );

    this.db$ = forkJoin({
      sqliteFile: dbFile,
      sqljs: this.sql$,
    }).pipe(
      map(
        ({ sqliteFile, sqljs }) =>
          new sqljs.Database(new Uint8Array(sqliteFile as any))
      ),
      shareReplay(),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );

    this.db$.subscribe(() => {
      this.dbDownloadProgress$.next(1.1);
      this.dbDownloadProgress$.complete();
    });
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
          '$1°$2\'$3.$50"W'
        );

    const res = geolib.toDecimal(sanitized);
    // console.log('LON', lon, sanitized, res);
    return res;
  }

  utmToLatLon(n: SqlJs.ValueType, e: SqlJs.ValueType) {
    let aa = this.utm.convertUtmToLatLng(+e!, +n!, 22, 'J');
    if (aa.lat < -180) aa = this.utm.convertUtmToLatLng(+e!, +n!, 21, 'J');
    const { lat, lng } = aa;
    return { lat: +lat, lng: +lng };
  }

  getDados(): Observable<Array<Data>> {
    return this.runSql(
      'SELECT * FROM dados_coletados WHERE longitude_o AND latitude_s !=  "" OR coordenadas_utm_e AND coordenadas_utm_n !=  ""'
    ).pipe(
      // No select são deixados de lados na cláusula where os dados que não tem coordenadas
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
              // Essa comparação funciona como uma intersecção,
              // o novo elemento é criado apenas se o dado atual for igual ao próximo

              // Para as coordenadas precisa de uma função de conversão para o formato aceito pelo geoJson
              arrayJson.push({
                bacia: obj[i]['bacia'],
                municipio: obj[i]['municipio'],
                lat:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLat(obj[i]['latitude_s'])
                    : (obj[i]['coordenadas_utm_n'] &&
                        obj[i]['coordenadas_utm_e']) !== ''
                    ? this.utmToLatLon(
                        obj[i]['coordenadas_utm_n'],
                        obj[i]['coordenadas_utm_e']
                      ).lat
                    : null,
                long:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLon(obj[i]['longitude_o'])
                    : (obj[i]['coordenadas_utm_n'] &&
                        obj[i]['coordenadas_utm_e']) !== ''
                    ? this.utmToLatLon(
                        obj[i]['coordenadas_utm_n'],
                        obj[i]['coordenadas_utm_e']
                      ).lng
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
              // Após a primeira aparição dos dados em comum é adicionado dentro do objeto em um array os parâmetros que mudam
              if (
                !arrayJson[j - 1].data.find(
                  (e) =>
                    e.parametro_conforme_artigo ===
                      obj[i]['parametro_conforme_artigo'] &&
                    e.unidade === obj[i]['unidade']
                )
              ) {
                arrayJson[j - 1].data.push({
                  parametro_conforme_artigo:
                    obj[i]['parametro_conforme_artigo'],
                  valor: obj[i]['valor'],
                  unidade: obj[i]['unidade'],
                });
              }
            } else {
              if (
                !arrayJson[j - 1].data.find(
                  (e) =>
                    e.parametro_conforme_artigo ===
                      obj[i]['parametro_conforme_artigo'] &&
                    e.unidade === obj[i]['unidade']
                )
              ) {
                arrayJson[j - 1].data.push({
                  parametro_conforme_artigo:
                    obj[i]['parametro_conforme_artigo'],
                  valor: obj[i]['valor'],
                  unidade: obj[i]['unidade'],
                });
              }
              notEnd = false;
              first = true;
            }
          } else {
            // Quando um dos parâmetros do próximo elemento não forem iguais ao atual
            // O último dado daquele agrupamento é adicionado e começará um novo elemento no agrupamento
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
                    : (obj[i]['coordenadas_utm_n'] &&
                        obj[i]['coordenadas_utm_e']) !== ''
                    ? this.utmToLatLon(
                        obj[i]['coordenadas_utm_n'],
                        obj[i]['coordenadas_utm_e']
                      ).lat
                    : null,
                long:
                  (obj[i]['latitude_s'] && obj[i]['longitude_o']) !== ''
                    ? this.convertLon(obj[i]['longitude_o'])
                    : (obj[i]['coordenadas_utm_e'] &&
                        obj[i]['coordenadas_utm_n']) !== ''
                    ? this.utmToLatLon(
                        obj[i]['coordenadas_utm_n'],
                        obj[i]['coordenadas_utm_e']
                      ).lng
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
