import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MbscModule } from '@mobiscroll/angular';
import { LoadingModule } from '../loading/loading.module';
import { MapModule } from '../map-view/map-view.module';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { SearchComponent } from '../searchAPI/search.component';
import { NotesModalComponent } from '../notes-modal/notes-modal.component';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { JobDetailsModalComponent } from '../jobdetails-modal/jobdetails-modal.component';
import { EditJobModalComponent } from '../editJob-modal/editJob-modal.component';
import { DatesModalComponent } from '../date-modal/date-modal.component';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

@NgModule({
  declarations: [
    HomeComponent,
    NotesModalComponent,
    EmployeeModalComponent,
    JobDetailsModalComponent,
    EditJobModalComponent,
    DatesModalComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    AngularDualListBoxModule,
    NgxSmartModalModule.forRoot(),
    RouterModule,
    LoadingModule,
    MapModule,
    FormsModule,
    ReactiveFormsModule,
    MbscModule,
    DatePickerModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [NgxSmartModalService]
})
export class HomeModule { }
