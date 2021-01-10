import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Data } from './models/data.models';
import { HttpClient } from "@angular/common/http";
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import * as data from "data.json";

@Injectable({
  providedIn: 'root',
})
export class DbService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getData(): Observable<Array<Data>> {
    return this.httpClient.get<Array<Data>>("./assets/teste.json");
  }
}
