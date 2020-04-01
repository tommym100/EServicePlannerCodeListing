import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppComponent } from '../app.component';
import {EmployeeService} from "../api/services/emp.service";
import { EmployeesComponent } from '../employees/employees.component';
import { NotifierService } from 'angular-notifier';

@Component({ 
  selector: 'app-addNewEmp-modal',
  templateUrl: './addNewEmp-modal.component.html',
  styleUrls: ['../home/home.component.scss']
})
export class AddNewEmpModalComponent implements OnInit {
  constructor(
    private appComponent: AppComponent,
    private employeePage: EmployeesComponent,
    private notifier: NotifierService,
    public ngxSmartModalService: NgxSmartModalService,
    private empService: EmployeeService) { }
    //set variables for employee
    empType = ["Select User Type", "Field", "Office", "Admin"];
    addErrMsg = "";
    firstName = "";
    lastName= "";
    mobileNum = "";
    userType = "Select User Type";
    emailAddy = "";
    password = "";

    //close the modal and reset vars
  onClose() {
    this.addErrMsg = "";
    this.firstName = "";
    this.lastName= "";
    this.mobileNum = "";
    this.userType = "Select User Type";
    this.emailAddy = "";
    this.password = "";
    this.ngxSmartModalService.resetModalData('newEmpModal');
  }

  //save new employee
  async onSave(){
    //check data to see if it is all valid and display message if not
    if(this.firstName == "" || !this.checkName(this.firstName)){
      this.addErrMsg = "Please add a valid first name"
    }else if(this.lastName == ""|| !this.checkName(this.firstName)){
      this.addErrMsg = "Please add a valid last name"
    }else if(!this.checkMobile(this.mobileNum)){
      this.addErrMsg = "Please enter a valid mobile number"
    }else if(this.userType == "Select User Type"){
      this.addErrMsg = "Please select a user type"
    }else if(!this.checkEmail(this.emailAddy)){
      this.addErrMsg = "Please enter a valid email address"
    }else if(!this.validatePassword(this.password)){
      this.addErrMsg = "Passwords must be more than 8 characters and contain one number"
    }else{
      this.appComponent.loading.show();//show loading
      this.addErrMsg = "";
      //if data is ok, check if the email is already is use
      const checkEmail = await this.empService.CheckForUserEmail(this.emailAddy);
      if(checkEmail > 0){
        this.notifier.notify("error", "Email address already exists, please use a different one or edit user: " + this.emailAddy);
        this.appComponent.loading.hide();//hide loading
        return;
      }

      //build object to add to the user db
      const empObj = {
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNum: this.mobileNum,
        userType: this.userType,
        emailAddy: this.emailAddy.toLowerCase()
      };
      //call to add employee to the db
      await this.empService.AddEmpAsync(empObj).then(resp => {
        if(resp == "success"){
          //call to add the credentials to the auth
          this.empService.CreateAuthUser(this.emailAddy.toLowerCase(), this.password);
          this.ngxSmartModalService.close('newEmpModal');//close the dialog
          this.appComponent.loading.hide();//hide loading
          this.employeePage.ngOnInit();
        }else{
          this.notifier.notify("error", "Error processing jobs, please try again");
          this.appComponent.loading.hide();//hide loading
        }
      });
    }
  }

  //validate the mobile number to uk standard
  checkName(name){
    const regex = /^[a-z ,.'-]+$/i;
    return regex.test(name);
  }

  //validate the mobile number to uk standard
  checkMobile(num){
    num = num.replace(/\s/g, "");
    const regex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/i;
    return regex.test(num);
  }

  //validate email address
  checkEmail(email){
    email = email.replace(/\s/g, "");
    const regex = /^^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i;
    return regex.test(email);
  }

  //validate password to greater than 8 chars and contains one number
  validatePassword(pass){
    if(pass.length < 8 || !(/\d/g).test(pass)){
      return false;
    }
    return true;
  }

  ngOnInit() {
  }

}
