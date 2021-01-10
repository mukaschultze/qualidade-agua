import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  myControl = new FormControl();
  filteredOptions$: Observable<string[]>;

  readonly MIN_SEARCH_LENGTH = 3;

  constructor(private searchService: SearchService) {
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
