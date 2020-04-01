import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapViewComponent } from './map-view.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';

@NgModule({
  declarations: [
    MapViewComponent
  ],
  exports: [
    MapViewComponent
  ],
  imports: [
    BrowserModule,
    NgxSmartModalModule.forRoot()
  ],
  providers: [NgxSmartModalService]
})
export class MapModule { }