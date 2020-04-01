import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { AuthService } from '../services/auth.service';
import { LoadingComponent } from '../loading/loading.component';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { FormGroupTypeSafe, FormBuilderTypeSafe } from '../providers/angular-reactive-forms-helper';
import { LoginModelIn } from '../api/models/login-model-in';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild(LoadingComponent) loading: LoadingComponent;
  constructor(
    private authService: AuthService,
    private appComponent: AppComponent,
    private router: Router,
    private route: ActivatedRoute,
    private notifier: NotifierService,
    private fb: FormBuilderTypeSafe,
    ) {
      if (this.authService.isAuthenticated) { //check if user is authenticated and directs to home page if so
        this.router.navigateByUrl('/home');
      } else {
        this.createForm();
      }
    };
  //sets login vars
  showNav = true;
  loginForm: FormGroupTypeSafe<LoginModelIn>;
  formSubmitAttempt = false;

    ngOnInit() {
      //subscrive the route and only display nav when the value is true
      this.route.data.subscribe((data) => {
        this.showNav = data.showNav;
      });
    }

    //create the form for login
    createForm() {
      this.loginForm = this.fb.group<LoginModelIn>({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required])
      });

    }

    //Get Form Field Value and test validation
    isFieldValid(fGroup: string, field: string) {
      const activeGroup = this.getFormGroup(fGroup);
      return (!activeGroup.get(field).valid && activeGroup.get(field).touched) || (activeGroup.get(field).untouched && this.formSubmitAttempt);
    }

    // Display the relevant css class for validation
    displayFieldCss(fGroup: string, field: string) {
      return { 'is-invalid': this.isFieldValid(fGroup, field) };
    }

    // Checker to see what Fields Are Invalid and highlight on Submission
    validateAllFormFields(formGroup: FormGroup) {
      Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.validateAllFormFields(control);
        }
      });
    }

    //return the form data
    getFormGroup(fGroup: string) {
      return this[fGroup];
    }

    //handle login
    login() {
      this.formSubmitAttempt = true;
      if (this.loginForm.valid) {//validate form
        this.loading.show();
        this.authService.login(this.loginForm.value.username, this.loginForm.value.password).then(() => {
          this.loading.hide();
          this.reset();
          this.appComponent.ngOnInit();
          this.router.navigateByUrl('/home');
        }).catch(error => {
          this.loading.hide();
          this.notifier.notify('error', error);
        });
      } else {
        this.validateAllFormFields(this.loginForm);
        this.notifier.notify('error', 'Username and Password are required.');
      }
    }

    reset() {
      this.formSubmitAttempt = false;
      this.createForm();
    }
  }
