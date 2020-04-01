import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MbscModule } from '@mobiscroll/angular';
import { RouterModule } from '@angular/router';
import { EmployeesComponent} from './employees.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import {AddNewEmpModalComponent} from '../addNewEmp-modal/addNewEmp-modal.component';
import {editEmpModalComponent} from '../editEmp-modal/editEmp-modal.component';

@NgModule({
  declarations: [
    EmployeesComponent,
    AddNewEmpModalComponent,
    editEmpModalComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MbscModule,
    NgxSmartModalModule.forRoot()
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [NgxSmartModalService]
})
export class EmployeesModule { }
