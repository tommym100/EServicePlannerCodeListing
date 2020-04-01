import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LoadingModule } from '../loading/loading.module';
import { LoginComponent } from './login.component';
import { DigitOnlyModule } from '@uiowa/digit-only';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    BrowserModule,
    LoadingModule,
    ReactiveFormsModule,
    FormsModule,
    DigitOnlyModule
  ],
  providers: []
})
export class LoginModule { }
