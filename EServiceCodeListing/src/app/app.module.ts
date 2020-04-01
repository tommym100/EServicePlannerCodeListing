import { HttpClientModule } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MbscModule, mobiscroll } from '@mobiscroll/angular';
import { NotifierModule } from 'angular-notifier';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSmartModalModule} from 'ngx-smart-modal';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxPopperModule } from 'ngx-popper';
import { AppComponent } from './app.component';
import { ClickOutsideDirective } from './directives/clickOutside.directive';
import { AuthGuard } from './guards/auth.guard';
import { HomeModule } from './home/home.module';
import { EmployeesModule } from './employees/employees.module';
import { AddJobModalComponent } from './addJob-modal/addJob-modal.component';
import { LoadingModule } from './loading/loading.module';
import { LoginModule } from './login/login.module';
import { NotifierConfig } from './notifier.config';
import { FormBuilderTypeSafe } from './providers/angular-reactive-forms-helper';
import { AppRoutingModule } from './router.module';
import { AuthService } from './services/auth.service';
import { MomentModule } from 'ngx-moment';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

mobiscroll.settings = {
  theme: 'eserviceplanner'
};

@NgModule({
   declarations: [
      AppComponent,
      AddJobModalComponent,
      ClickOutsideDirective
   ],
   imports: [
      MbscModule,
      MomentModule,
      HttpClientModule,
      BrowserModule,
      NgxPermissionsModule.forRoot(),
      NgxSmartModalModule.forRoot(),
      InfiniteScrollModule,
      AppRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      NgxPopperModule,
      NotifierModule.withConfig(NotifierConfig),
      LoginModule,
      LoadingModule,
      HomeModule,
      EmployeesModule,
      ServiceWorkerModule,
      DatePickerModule
    ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    AuthGuard,
    AuthService,
    FormBuilderTypeSafe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
