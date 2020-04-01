/* tslint:disable */
import { Injectable } from '@angular/core';
import firebase from './firebase.service';

@Injectable({
  providedIn: 'root',
})
class AccountService {
  //secure getter for google API
  private googleApi = "";
  getGoogleApi(){
    return this.googleApi;
  }

  injectGoogleMaps(){
    const src = "https://maps.googleapis.com/maps/api/js?key=" + this.getGoogleApi();
    if(!document.querySelector('script[src="' + src + '"]')){
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = src;
      document.body.appendChild(script);
    }
  }
  
  //log the user out and clear firebase credentials
  async LogoutAsync() {
    return firebase.auth().signOut().then(resp => {
      return "success";
    }).catch(function(error) {
      return error.message;
    });
  }

  //log the user in via firebase credentials
  async LoginAsync(email, password) {
    //set up a session auth
  return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
    //authenticate with email and password
    return firebase.auth().signInWithEmailAndPassword(email, password).then(resp => {
      return "success";
    }).catch(function(error) {
      return error.message;
    });
  })
  .catch(function(error) {
    const errorMessage = error.message;
    return errorMessage;
  });
  }

  //check to see if the user has a current active session
  async IsUserAuthenticated(){
    let user = sessionStorage.getItem('firebase:authUser:[DEFAULT]') || false;
    if(user){
      user = JSON.parse(user).email;
    }
    return user;
  }
}


export { AccountService }
