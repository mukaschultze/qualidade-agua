import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  mapTo,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { DatabaseService } from '../database.service';
import { Data } from '../models/data.models';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class SearchBarComponent {
  myControl = new FormControl();
  filteredOptions$: Observable<Data[]>;

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
          ? this.searchService.search("").pipe(mapTo([]))
          : this.searchService.search(search)
      ),
      shareReplay()
    );
  }

  filter(selected: Data){
    
  }

}
