import { Injectable } from '@angular/core';
import { of, ReplaySubject, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Data } from './models/data.models';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  data: Array<Data> = [];
  pesquisa$ = new ReplaySubject<string>(1);


  constructor(private dbService: DatabaseService) {
    this.dbService.getDados().subscribe((data) => {
      this.data = data.filter((a, idx) => data.findIndex((b)=>b.municipio === a.municipio) === idx);
    });
    this.pesquisa$.next("");
  }


  search(pesquisa: string) {
    this.pesquisa$.next(pesquisa);
    return of(this.data).pipe(
      delay(500),
      map((res) => res.filter((e) => {
        if (typeof e.municipio === "string" &&  e.municipio.toLocaleUpperCase().includes(pesquisa.toLocaleUpperCase()))
          return true;
        if (typeof e.bacia === "string" &&  e.bacia.toLocaleUpperCase().includes(pesquisa.toLocaleUpperCase()))
          return true;
        return false;
        }))
    );
  }
}
