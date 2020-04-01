import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import * as moment from 'moment';
import axios from 'axios';
import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { JobService } from '../api/services/job.service';
import { NotifierService } from 'angular-notifier';
import { AccountService } from '../api/services/account.service';
import { HomeComponent } from '../home/home.component';

@Component({ 
  selector: 'app-editJob-modal',
  templateUrl: './editJob-modal.component.html',
  styleUrls: ['../home/home.component.scss']
})
export class EditJobModalComponent implements OnInit {
  constructor(
    private jobService: JobService,
    private homeComponent: HomeComponent,
    private notifier: NotifierService,
    private accountService: AccountService,

    public ngxSmartModalService: NgxSmartModalService) { }
    //vars for job details
  jobTitle;
  data;

  //set variables for select lists
  jobTypes = ["Select job type", "Delivery", "Collection", "Service"];
  unitTypes = ["Select unit type", "Basic Unit", "Accessible Unit", "Urinal Block", "Private Block"];
  routes = ["Select Route", "South Down", "Coleraine", "Peninsula", "Ballymena", "Magherafelt", "Omagh", "Carrick", "Derry", "South Belfast", "Down - Armagh", "North-East Belfast", "Antrim"];
  
  //set variables for job component
  jobType = "Select job type";
  custAddStr = "";
  custName = "";
  houseNum = new Number();
  postCode = "";
  custAddObj = { Address1: "", Address2: "", City: "", Postcode: "", lat: "", lng: "" };
  selectedRoute = "Select Route";
  units = [];
  unitType = "Select unit type";
  unitQtdy = 0;
  addErrMsg = "";
  note = "";
  minDate = new Date();
  startDate = new Date();
  status = "";
  route = "";

    //get data and add to scope
    onOpen() {
      this.jobTitle = '';
      this.data = this.ngxSmartModalService.getModalData('editJobModal');
      this.data.JobDate = this.data.JobDate;
      this.jobTitle = this.data.JobId + " - " + this.data.Address1;
      this.jobType = this.data.JobType;
      this.custAddStr = this.data.Address1 + "," + this.data.City;
      this.custName = this.data.CustomerName;
      this.houseNum = parseInt(this.data.Address1) || new Number();
      this.postCode = this.data.Postcode;
      this.custAddObj = { Address1: this.data.Address1, Address2: this.data.Address2, City: this.data.City, Postcode: this.data.Postcode, lat: this.data.lat, lng: this.data.lng };
      this.units = [...this.data.Details];
      this.unitType = "Select unit type";
      this.unitQtdy = 0;
      this.addErrMsg = "";
      this.note = "";
      this.minDate = this.getMinDate();
      this.startDate = new Date(this.data.JobDate);
      this.status = this.data.Status;
      this.route = this.data.Route;
      this.selectedRoute = this.getRoute();
    }
  
    //reset modal data
    onClose() {
      this.ngxSmartModalService.resetModalData('editJobModal');
    }

    onRenderCell(args: RenderDayCellEventArgs): void { //disable sundays for start or finish date
      if (args.date.getDay() == 0) {
          //sets isDisabled to true to disable the date.
          args.isDisabled = true;
          //To know about the disabled date customization, you can refer in "styles.css".
      }
    }

  getMinDate(){
    let minDate = new Date();
    if (minDate.getDay() == 0){
      minDate.setDate(minDate.getDate() + 1);
    }
    return minDate;
  }

  //creates a string from selected unit and adds it to the array 
  addUnit() {
    if(this.unitType == "Select unit type"){
      this.addErrMsg = "Please select a unit type"
    }else if(this.unitType == ""){
      this.addErrMsg = "Please select a unit type"
    }else if(this.unitQtdy <= 0){
      this.addErrMsg = "Enter a number greater than zero"
    }else{
      let updated = false;
      for(let t = 0; t < this.units.length; t++){
        if(this.units[t].type == this.unitType){
            this.units[t].qtdy += this.unitQtdy;
            updated = true;
            break;
        }
    }
    if(!updated){
      this.units.push({
        name: this.unitType,
        qtdy: this.unitQtdy
      });
    }
      this.unitType = "Select unit type";
      this.unitQtdy = 0;
      this.addErrMsg = "";
    }
  }

  //removes the selected unit from the array
  removeUnit(i) {
    this.units.splice(i,1);
  }

  //updated the start date
  changeStartDate(event){
      if(event.value && event.value.getDay() == 0){
        this.startDate = new Date(event.value.setDate(event.value.getDate() + 1));
        this.notifier.notify("error", "Jobs cannot be set on a Sunday. Date has changed to" + this.startDate.toLocaleDateString());
        return;
      }
      if(event.value && event.value < new Date()){
        this.startDate = null;
        this.notifier.notify("error", "Jobs cannot be moved to the past.");
      }
  }

  //use regex to validate the postcode
  valid_postcode(postcode) {
    postcode = postcode.replace(/\s/g, "");
    const regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i;
    return regex.test(postcode);
  }

  //gets the address from the house number and postcode supplied
  findAddress(){
    if(this.houseNum < 1){
      this.addErrMsg = "Please enter a valid house number";
    }else if(!this.valid_postcode(this.postCode)){
      this.addErrMsg = "Please enter a valid postcode";
    }else{
      let self = this;
      this.postCode = this.postCode.replace(/\s/g, "");
      const url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + this.postCode + "&key=" + this.accountService.getGoogleApi();
      //call to google passing the secure api key - will return an object containing details of the address including lat and lng
      axios.get(url).then(function(response){
      let addrComp = response.data.results[0].address_components;
      let add1 = "";
      let add2 = "";
      let city = "";
      let postCode = "";
      for(let t = 0; t < addrComp.length; t++){
        switch (true) {
          case addrComp[t].types.includes('route'): //addr1
            add1 = self.houseNum + " " + addrComp[t].long_name;
            break;
          case addrComp[t].types.includes('locality'): //addr2
            add2 = addrComp[t].long_name;
            break;
          case addrComp[t].types.includes('postal_town'): //city
            city = addrComp[t].long_name;
            break;
          case addrComp[t].types.includes('postal_code'):
            postCode = addrComp[t].long_name;
            break;
          default:
            break;
        }
      }
       self.custAddObj = {
        Address1: add1,
        Address2: add2,
        City: city,
        Postcode: postCode,
        lat:response.data.results[0].geometry.location.lat,
        lng: response.data.results[0].geometry.location.lng
      };
      self.custAddStr = add1 + ", " + city;

     }).catch(function(){
       self.addErrMsg = "Unable to find address";
     });
      this.addErrMsg = "";
    }
  }

  //save job will check all fields are complete and warn the user if not then add the jobs to the DB
  async onSave (){
    //do checks and return a warning if theres an issue
    if(!this.startDate){
      this.addErrMsg = "Please select a start date";
    }else if(!this.custName){
      this.addErrMsg = "Please add a customer name";
    }else if(!this.custAddStr){
      this.addErrMsg = "Please add a customer address";
    }else if(this.units.length < 1){
      this.addErrMsg = "Please add units to the order";
    }else{//get here if there are no issues
      this.homeComponent.loading.show();
      let noteArr = this.data.Notes || [];
      this.startDate.setHours(3);
      //build the job
      //call to the db to get the next job id
      let jobId = this.data.JobId;
      const route = this.getRouteCode();
      const jobToBeAdded = {
            id: this.data.id,
            JobId: jobId,
            JobDate: this.startDate.toISOString().split("T")[0],
            JobType: this.jobType,
            CustomerName: this.custName,
            Address1: this.custAddObj.Address1,
            Address2: this.custAddObj.Address2,
            City: this.custAddObj.City,
            Postcode: this.custAddObj.Postcode,
            lat: this.custAddObj.lat,
            lng: this.custAddObj.lng,
            Route: route,
            Details: this.units,
            Notes: noteArr,
            Status: "New"
        };

        //call to the job service to add the jobs to the DB
        await this.jobService.EditJobsAsync(jobToBeAdded).then(resp => {
          if(resp == "success"){
            this.ngxSmartModalService.close('editJobModal');//close the dialog
            this.homeComponent.ngOnInit();
            this.homeComponent.loading.hide();
          }else{
            this.notifier.notify("error", "Error processing job, please try again");
            this.homeComponent.loading.hide();
          }
        });
    }
  }

  async onDelete(){
    if(confirm("Are you sure you wish to delete " + this.jobTitle + "?")){
        //call to the job service to delete the job from the DB
        await this.jobService.DeleteJobsAsync(this.data.id).then(resp => {
          if(resp == "success"){
            this.ngxSmartModalService.close('editJobModal');//close the dialog
            this.onClose();
            this.homeComponent.ngOnInit();
            this.homeComponent.loading.hide();
          }else{
            this.notifier.notify("error", "Error deleting job, please try again");
            this.homeComponent.loading.hide();
          }
        });
    }
    return;
  }

  //set the route code based on the selected route
  getRouteCode(){
    for(let t = 1; t < this.routes.length; t++){
      if(this.selectedRoute == "Select Route"){
        return "U";
      }else if(this.selectedRoute == "South Down"){
        return "SDwn";
      }else if(this.selectedRoute == "Coleraine"){
        return "Col";
      }else if(this.selectedRoute == "Peninsula"){
        return "Pen";
      }else if(this.selectedRoute == "Ballymena"){
        return "Bal";
      }else if(this.selectedRoute == "Magherafelt"){
        return "Mag";
      }else if(this.selectedRoute == "Omagh"){
        return "Oma";
      }else if(this.selectedRoute == "Carrick"){
        return "Car";
      }else if(this.selectedRoute == "Derry"){
        return "Der";
      }else if(this.selectedRoute == "South Belfast"){
        return "SBef";
      }else if(this.selectedRoute == "Down - Armagh"){
        return "Dwn-Arm";
      }else if(this.selectedRoute == "North-East Belfast"){
        return "N-EBef";
      }else if(this.selectedRoute == "Antrim"){
        return "Ant";
      }else{
        return "U";
      }
    }
  }
  //set the route code based on the selected route
  getRoute(){
    for(let t = 1; t < this.routes.length; t++){
      if(this.data.Route == "U"){
        return "Select Route";
      }else if(this.data.Route == "SDwn"){
        return "South Down";
      }else if(this.data.Route == "Col"){
        return "Coleraine";
      }else if(this.data.Route == "Pen"){
        return "Peninsula";
      }else if(this.data.Route == "Bal"){
        return "Ballymena";
      }else if(this.data.Route == "Mag"){
        return "Magherafelt";
      }else if(this.data.Route == "Oma"){
        return "Omagh";
      }else if(this.data.Route == "Car"){
        return "Carrick";
      }else if(this.data.Route == "Der"){
        return "Derry";
      }else if(this.data.Route == "SBef"){
        return "South Belfast";
      }else if(this.data.Route == "Dwn-Arm"){
        return "Down - Armagh";
      }else if(this.data.Route == "N-EBef"){
        return "North-East Belfast";
      }else if(this.data.Route == "Ant"){
        return "Antrim";
      }else{
        return "Select Route";
      }
    }
  }

  //find the difference between two dates
  dayDiff(d1, d2){
    // To calculate the time difference of two dates 
    let Difference_In_Time = d2.getTime() - d1.getTime(); 
    // To calculate the no. of days between two dates 
    return Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
  }

  ngOnInit() {
    
  }

}
