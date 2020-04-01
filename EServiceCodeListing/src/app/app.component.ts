import { Component, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { PopperController } from 'ngx-popper';
import { filter, map, mergeMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { LoadingComponent } from './loading/loading.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { EmployeeService } from './api/services/emp.service';
import { AccountService } from './api/services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChildren(PopperController) tooltips: PopperController[];
  @ViewChild(LoadingComponent) loading: LoadingComponent;

  constructor(
    public authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notifier: NotifierService,
    private accountService: AccountService,
    public empService: EmployeeService,
    public ngxSmartModalService: NgxSmartModalService
  ) {
    //set the menu to closed on load
    this.menuOpen = false;
    //build rout trigger events that will close the menu when navigating between pages
    router.events.subscribe((val: RouterEvent) => {
      if (val instanceof NavigationEnd) {
        this.menuOpen = false;
        this.showUserMenu = false;
      }
      this.navigationInterceptor(val);
    });
    //check to see if the user is authenticated
    this.authService.isUserAuthenticated();
  }

  //vars for the page
  title = 'E-Planner';
  routerSub$: any;
  showNav = true;
  showUserMenu = false;
  menuOpen = true;
  addUserOpen = false;
  isAdmin = null;
  user;
  userType = "";
  isAuthenticated = false;

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (this.loading) {
      if (event instanceof NavigationStart) {
        this.loading.show();
      }
      if (event instanceof NavigationEnd) {
        this.loading.hide();
      }

      // Set loading state to false in both of the below events to hide the spinner in case a request fails
      if (event instanceof NavigationCancel) {
        this.loading.hide();
      }
      if (event instanceof NavigationError) {
        this.loading.hide();
      }
    }
  }

  //returns the user name
  getUser(){
    return this.user;
  }

  //returns user type
  getUserType(){
    return this.userType;
  }

  //returns boolean for admin status
  getAdmin(){
    return this.isAdmin;
  }

  //clears user info
  private resetUser(){
    this.user = null;
    this.userType = null;
    this.isAdmin = null;
  }

  async ngOnInit() {
    //check if user is Authenticated
    this.user = await this.accountService.IsUserAuthenticated(); //returns user or null
    this.isAuthenticated = this.user ? true : false;
    if(this.isAuthenticated){ //if authenticated, get the user type
      this.userType = await this.empService.GetUserType(this.user);
    }else{//else log the user out and (this also check if the user has been manually logged out due to session it will display a message)
      !window.location.href.includes("loggedout") ? this.notifier.notify('error', "Session has expired, please sign in again") : null;
      this.authService.logout();
      return;
    }
    this.accountService.injectGoogleMaps();//once we know the user is authenticated, inject google maps 
    this.isAdmin = this.userType == "Admin" ? true : false;
    //sets the rout for the application 
    this.routerSub$ = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(map(route => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      }))
      .pipe(filter(route => route.outlet === 'primary'))
      .pipe(mergeMap(route => route.data))
      .subscribe((data) => { //subsicrives the data from the active route
        let title = data.title || '';
        const paramRegex = new RegExp(/\:([a-z]+)/gi);
        const match = title.match(paramRegex) || false;
        if (match) {
          for (const token of match) {
            title = title.replace(token, data.model[token.replace(':', '')]);
          }
        }
        this.title = title;
        this.showNav = data.showNav || false;
      });
  }

  ngOnDestroy(): void {
    this.routerSub$.unsubscribe();
  }

  //shows and hides the user menu
  toggleMenu() {
    this.tooltips.forEach((el) => {
      el.hide();
    });
    this.menuOpen = !this.menuOpen;
    localStorage.setItem('dje:menuOpen', `${this.menuOpen}`);
  }

  //opens the add job modal
  addJob() {
    this.loading.show();
    this.ngxSmartModalService.setModalData({}, 'addJobModal');
    this.ngxSmartModalService.open('addJobModal');
    this.menuOpen ? this.toggleMenu() : null;
    this.loading.hide();
  }

  //logs the user out
  logout() {
    this.authService.logout().then(()=> {
      this.resetUser();
      this.router.navigateByUrl("/login?loggedout=true");
      this.ngOnInit();
    }).catch(err => {
      this.notifier.notify('error', 'There was an error with logging out!');
    });
  }
}
