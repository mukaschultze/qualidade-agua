import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, from, Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import type * as initSqlJsTypes from 'sql.js';
import { SqlJs } from 'sql.js/module';

initSqlJs = (window as any).initSqlJs as typeof initSqlJsTypes;

@Injectable({ providedIn: 'root' })
export class DatabaseService {
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

    this.runSql('SELECT * FROM dados_coletados').subscribe((a) =>
      console.log(a[0])
    );

    //.pipe(([sqlite, sqljs] )=> new sqljs.);
    //this.sql$.pipe(map((s) => new s.Database()));
  }

  runSql(sql: string) {
    return this.db$.pipe(map((bd) => bd.exec(sql)));
  }
}
