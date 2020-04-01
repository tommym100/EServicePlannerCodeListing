/* tslint:disable */
import { Injectable } from '@angular/core';
import firebase from './firebase.service';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root',
})
class EmployeeService {

  constructor( public notifier: NotifierService ) { }

  //call to return all emp in an array of emp objects
  async GetEmployeesAsync(){
    let objArr = [];
    const ref = firebase.database().ref("Employees");
    const snapshot = await ref.orderByChild('firstName').once("value");
    const emps = snapshot.val() || {};
    Object.keys(emps).map(function(key) {
      objArr.push(emps[key]);
    });
    return objArr;
  };

  //call to return any employees with a type of driver
  async GetDriversAsync(){
    let empArr = [];
    const ref = firebase.database().ref("Employees");
    const snapshot = await ref.orderByChild('userType').equalTo("Field").once("value");
    const emps = snapshot.val() || {};
    Object.keys(emps).map(function(key) {
      empArr.push(emps[key]);
    });
    return empArr;
  };

  //adds new employee data to the db
  async AddEmpAsync(empObj){
    let updates = {};
    const newPostKey = firebase.database().ref().child('Employees').push().key;//get the firebase db key for this new entry
    empObj.id = newPostKey;
    updates['/Employees/' + newPostKey] = empObj;
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //updates an employee data in the db
  async UpdateEmpAsync(empObj){
    let updates = {};
    updates['/Employees/' + empObj.id] = empObj;
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //delete an employee from the db
  async DeleteEmpAsync(empObj){
    return firebase.database().ref('/Employees/' + empObj.id).remove().then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //returns any matching employee to that supplied for checking
  async CheckForUserEmail(email){
    let empArr = [];
    const ref = firebase.database().ref("Employees");
    const snapshot = await ref.orderByChild('emailAddy').equalTo(email.toLowerCase()).once("value");
    const emps = snapshot.val() || {};
    Object.keys(emps).map(function(key) {
      empArr.push(emps[key]);
    });
    return empArr.length;
  }

  //returns the user type of a given email
  async GetUserType(email){
    let userType;
    const ref = firebase.database().ref("Employees");
    const snapshot = await ref.orderByChild('emailAddy').equalTo(email.toLowerCase()).once("value");
    const emps = snapshot.val() || {};
    Object.keys(emps).map(function(key) {
      userType = emps[key].userType;
    });
    return userType;
  }

  //generates a secure authenticated uyser in Firebase
  async CreateAuthUser(email, password){
    return firebase.auth().createUserWithEmailAndPassword(email, password).then(resp => {
      return "success";
    }).catch(function(error) {
      this.notifier.notify("error", "Failed to create authenticated user: " + error.message)
      return "error";
    });
  }

  //todo add a call to update the client email address
  async UpdateEmpEmailAsync(email){
    
  }

  //todo add a call to update the client password
  async UpdateEmpPasswordAsync(password){

  }
}

export { EmployeeService }
