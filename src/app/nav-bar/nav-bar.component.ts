import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { DatabaseService } from '../database.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class SearchBarComponent {
  myControl = new FormControl();
  filteredOptions$: Observable<string[]>;

  readonly MIN_SEARCH_LENGTH = 3;
  readonly dbDownloadProgress$: Observable<number>;

  constructor(
    private searchService: SearchService,
    private databaseService: DatabaseService
  ) {
    this.dbDownloadProgress$ = this.databaseService.dbDownloadProgress$;
    this.filteredOptions$ = this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      switchMap((search: string) =>
        search.length <= this.MIN_SEARCH_LENGTH
          ? of([])
          : this.searchService.search(search)
      ),
      shareReplay()
    );
  }
}
