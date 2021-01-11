import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as geolib from 'geolib';
import { EMPTY, forkJoin, from, Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import type * as initSqlJsTypes from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as utmObj from 'utm-latlng';

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
          /.+?(\d+).+?(\d+).+?(\d+)(\.|,(\d+))?.+/g,
          '$1°$2\'$3.$50"S'
        );

    return geolib.toDecimal(sanitized);
  }

  convertLon(lon: any) {
    const sanitized = !isNaN(+lon!)
      ? +lon!
      : (lon as string).replace(
          /.+?(\d+).+?(\d+).+?(\d+)(\.|,(\d+))?.+/g,
          '$1°$2\'$3.$50"O'
        );

    return geolib.toDecimal(sanitized);
  }

  utmToLatLon(n: SqlJs.ValueType, e: SqlJs.ValueType) {
    let aa = this.utm.convertUtmToLatLng(+e!, +n!, 22, 'J');
    if (aa.lat < -180) aa = this.utm.convertUtmToLatLng(+e!, +n!, 21, 'J');
    const { lat, lgn } = aa;
    return { lat: +lat, lgn: +lgn };
  }
}
