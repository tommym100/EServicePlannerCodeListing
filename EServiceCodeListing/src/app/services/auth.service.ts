import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccountService } from '../api/services/account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authed = new BehaviorSubject<boolean>(false);

  constructor(
    private accountService: AccountService,
    private permissionsService: NgxPermissionsService
  ) {
    //check if the user is authenticated and redirects to the home page if so
    this.isUserAuthenticated();
  }

  //calls the logout method and resets user data
  async logout() {
    return new Promise((resolve, reject) => {
      this.accountService.LogoutAsync().then(resp => {
        this.authed.next(false);
        this.permissionsService.flushPermissions();
        resolve();
      })
    });
  }

  //calls the login method using the username and password
  public login(username, password) {
    return new Promise((resolve, reject) => {
      this.accountService.LoginAsync(username, password ).then(response => {
        if(response == "success"){
          this.authed.next(true);
          resolve();
        }else{
          reject(response);
        }
      }, reject);
    });
  }

  //returns if the user is authenticated
  public get isAuthenticated() {
    return this.authed.value;
  }

  //check if the user is authenticated against the account service
  async isUserAuthenticated(){
    let isAuth = await this.accountService.IsUserAuthenticated();
    if (isAuth) {
      this.authed.next(true);
    } else {
      this.authed.next(false);
    }
  }

}
