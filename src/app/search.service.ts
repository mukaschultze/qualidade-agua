import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor() {}

  search(pesquisa: string) {
    return of(['One', 'Two', 'Three']).pipe(
      delay(500),
      map((res) => res.filter((e) => e.includes(pesquisa)))
    );
  }
}
