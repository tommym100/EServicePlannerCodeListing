import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppComponent } from '../app.component';
import {EmployeeService} from "../api/services/emp.service";
import { EmployeesComponent } from '../employees/employees.component';
import { NotifierService } from 'angular-notifier';

@Component({ 
  selector: 'app-editEmp-modal',
  templateUrl: './editEmp-modal.component.html',
  styleUrls: ['../home/home.component.scss']
})
export class editEmpModalComponent implements OnInit {
  constructor(
    private employeePage: EmployeesComponent,
    private appComp: AppComponent,
    private notifier: NotifierService,
    public ngxSmartModalService: NgxSmartModalService,
    private empService: EmployeeService) { }
    //vars for the edit employee form
    empType = ["Select User Type", "Field", "Office", "Admin"];
    addErrMsg = "";
    firstName = "";
    lastName= "";
    mobileNum = "";
    userType = "Select User Type";
    emailAddy = "";
    id = "";
    password = "";
    updatePassword = false;
    oldEmail = "";
    updateEmail = false;

    //open and retrieve the employee data
  onOpen() {
    const data = this.ngxSmartModalService.getModalData('editEmpModal');
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName= data.lastName;
    this.mobileNum = data.mobileNum;
    this.userType = data.userType;
    this.emailAddy = data.emailAddy;
    this.oldEmail = data.emailAddy;
    this.password = "";
  }

  //reset the data on close
  onClose() {
    this.addErrMsg = "";
    this.id = "";
    this.firstName = "";
    this.lastName= "";
    this.mobileNum = "";
    this.userType = "Select User Type";
    this.emailAddy = "";
    this.password = "";
    this.ngxSmartModalService.resetModalData('editEmpModal');
  }

  //check all fields are valid and display error is not
  async onSave(){
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
      this.appComp.loading.show();//show loading
      this.addErrMsg = "";

      //update this employee in the employee db
      const empObj = {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNum: this.mobileNum,
        userType: this.userType,
        emailAddy: this.emailAddy
      };
      //update the employee in the db 
      this.empService.UpdateEmpAsync(empObj).then(resp => {
        if(resp == "success"){
          //todo add this functionality - it requires admin service sdk 
          //check if email.password has changed and update
          // if(this.emailAddy !== this.oldEmail){
          //   this.empService.UpdateEmpEmailAsync(this.emailAddy);
          // }
          // if(this.updateEmail){
          //   this.empService.UpdateEmpPasswordAsync(this.password);
          // }
          this.ngxSmartModalService.close('editEmpModal');//close the dialog
          this.appComp.loading.hide();//hide loading
          this.employeePage.ngOnInit();
        }else{
          this.notifier.notify("error", "Error processing jobs, please try again");
          this.appComp.loading.hide();//hide loading
        }
      });
    }
  }

  //validate the mobile number to uk standard
  checkName(name){
    const regex = /^[a-z ,.'-]+$/i;
    return regex.test(name);
  }
  //validate uk mobile number
  checkMobile(num){
    num = num.replace(/\s/g, "");
    const regex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/i;
    return regex.test(num);
  }
  //validate email
  checkEmail(email){
    email = email.replace(/\s/g, "");
    const regex = /^^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i;
    return regex.test(email);
  }

  //validate password
  validatePassword(pass){
    if(pass.length == 0){
      return true;
    }else if(pass.length < 8 || !(/\d/g).test(pass)){
      return false;
    }else{
      this.updatePassword = true;
      return true;
    }
  }

  //remove the employee from the db
  async onDelete(){
    const data = this.ngxSmartModalService.getModalData('editEmpModal');
    if(confirm("Are you sure you would like to permanently remove " + data.firstName + " " + data.lastName + "'s account?")){
      //update this employee in the emoloyee db
      const empObj = {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNum: this.mobileNum,
        userType: this.userType,
        emailAddy: this.emailAddy
      };
      await this.empService.DeleteEmpAsync(empObj).then(resp => {
        if(resp == "success"){
          this.ngxSmartModalService.close('editEmpModal');//close the dialog
          this.appComp.loading.hide();//hide loading
          this.employeePage.ngOnInit();

        }else{
          this.notifier.notify("error", "Error processing jobs, please try again");
          this.appComp.loading.hide();//hide loading
        }
      });
    }
  }

  ngOnInit() {
  }

}
