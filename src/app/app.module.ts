import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  declarations: [AppComponent, MapComponent],
  imports: [BrowserModule, BrowserAnimationsModule, LeafletModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
