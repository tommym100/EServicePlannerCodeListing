import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ViewChild } from '@angular/core';
import * as moment from 'moment';
import axios from 'axios';
import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { JobService } from '../api/services/job.service';
import { LoadingComponent } from '../loading/loading.component';
import { NotifierService } from 'angular-notifier';
import { AccountService } from '../api/services/account.service';
import { AppComponent } from '../app.component';

@Component({ 
  selector: 'app-addJob-modal',
  templateUrl: './addJob-modal.component.html',
  styleUrls: ['../home/home.component.scss']
})
export class AddJobModalComponent implements OnInit {
  @ViewChild(LoadingComponent) 
  loading: LoadingComponent;
  constructor(
    private jobService: JobService,
    private appComponent: AppComponent,
    private notifier: NotifierService,
    private accountService: AccountService,
    public ngxSmartModalService: NgxSmartModalService) { }
  
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
  endDate;

    onRenderCell(args: RenderDayCellEventArgs): void { //disable sundays for start or finish date
      if (args.date.getDay() == 0) {
          //sets isDisabled to true to disable the date.
          args.isDisabled = true;
          //To know about the disabled date customization, you can refer in "styles.css".
      }
    }

    //initalise vars for the new job
  onOpen() {
    this.jobType = "Select job type";
    this.custAddStr = "";
    this.custName = "";
    this.houseNum = new Number();
    this.postCode = "";
    this.custAddObj = { Address1: "", Address2: "", City: "", Postcode: "", lat: "", lng: "" }
    this.units = [];
    this.unitType = "Select unit type";
    this.unitQtdy = 0;
    this.addErrMsg = "";
    this.note = "";
    this.minDate = this.getMinDate();
    this.startDate = this.minDate;
    this.endDate =  null;
  }

    //close modal and reset all variables 
  onClose() {
    this.ngxSmartModalService.resetModalData('addJobModal');
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

  changeType(){
    this.endDate = null;
  }

  //removes the selected unit from the array
  removeUnit(i) {
    this.units.splice(i,1);
  }

  //updated the start date
  changeStartDate(event){

      if(event.value && event.value < new Date().setHours(1)){
        this.startDate = new Date(new Date().setHours(23));
        this.notifier.notify("error", "Jobs cannot be set in the past. Date has changed to " + this.startDate.toLocaleDateString());
        return;
      }
      if(event.value && event.value.getDay() == 0){
        this.startDate = new Date(event.value.setDate(event.value.getDate() + 1));
        this.notifier.notify("error", "Jobs cannot be set on a Sunday. Date has changed to " + this.startDate.toLocaleDateString());
        return;
      }

      this.startDate = event.value;
      if(this.endDate && this.endDate < this.startDate){
        this.endDate.setDate(this.startDate.getDate() +1);
        this.notifier.notify("error", "End date cannot be before the start date. Please select a new end date.");
      }
      //todo - remove end date if start is updated to after end date
  }

  //update the end date 
  changeEndDate(event){
    if(event.value && event.value < new Date().setHours(1)){
      this.endDate = new Date(new Date().setHours(23));
      this.notifier.notify("error", "Jobs cannot be set in the past. Date has changed to " + this.startDate.toLocaleDateString());
      return;
    }
    if(event.value && event.value.getDay() == 0){
      this.endDate = new Date(event.value.setDate(event.value.getDate() + 1));
      this.notifier.notify("error", "Jobs cannot be set on a Sunday. Date has changed to " + this.endDate.toLocaleDateString());
      return;
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
    }else if((this.jobType == "Delivery" && !this.endDate) && !confirm("You have not set an end date for this delivery. No collection job will be added")){
    }else if(!this.custName){
      this.addErrMsg = "Please add a customer name";
    }else if(!this.custAddStr){
      this.addErrMsg = "Please add a customer address";
    }else if(this.units.length < 1){
      this.addErrMsg = "Please add units to the order";
    }else{//get here if there are no issues
      //check notes and build a string
      this.loading.show();
      let noteArr = [];
      if(this.note != ""){
        let nowDate = new Date();
        let formateNowDate = moment(nowDate).format("DD/MM/YYYY - HH:mm");
        const noteObj = {
          name: this.appComponent.getUser(),
          dateTime: formateNowDate,
          note: this.note
        }
        noteArr.push(noteObj);
      };
      //build the first job
      let jobsToBeAdded = [];
      //call to the db to get the next job id
      let jobCountId = await this.jobService.getJobCounter();
      jobCountId++;
      let jobId = "Job" + jobCountId;
      const route = this.getRouteCode();
      jobsToBeAdded.push({
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
        });

          //if there is a finish date, make a collection job for that date
        if(this.jobType == "Delivery" && this.endDate){
          jobCountId++;
          let jobId = "Job" + jobCountId;
            jobsToBeAdded.push({
              JobId: jobId,
              JobDate: this.endDate.toISOString().split("T")[0],
              JobType: "Collection",
              CustomerName: this.custName,
              Address1: this.custAddObj.Address1,
              Address2: this.custAddObj.Address2,
              City: this.custAddObj.City,
              Postcode: this.custAddObj.Postcode,
              lat: this.custAddObj.lat,
              lng: this.custAddObj.lng,
              Route: "U",
              Details: this.units,
              Notes: [],
              Status: "New"
            });
        };

        //if there is a finish date greater than 30 days, make a Service job for that date
        if((this.jobType == "Delivery" && this.endDate) && (this.dayDiff(this.startDate, this.endDate) > 35)){
          //build the finish date
          let serviceDate = new Date(this.startDate);
          serviceDate.setDate(this.startDate.getDate() + 30);
          //if sunday then move to monday
          if(serviceDate.getDay() == 0){ 
            serviceDate.setDate(serviceDate.getDate() + 1);
          }
          jobCountId++;
          let jobId = "Job" + jobCountId;
            jobsToBeAdded.push({
              JobId: jobId,
              JobDate: serviceDate.toISOString().split("T")[0],
              JobType: "Service",
              CustomerName: this.custName,
              Address1: this.custAddObj.Address1,
              Address2: this.custAddObj.Address2,
              City: this.custAddObj.City,
              Postcode: this.custAddObj.Postcode,
              lat: this.custAddObj.lat,
              lng: this.custAddObj.lng,
              Route: "U",
              Details: this.units,
              Notes: [],
              Status: "New"
            });
        };

        //updates the job count for the ID counter
        this.jobService.SetJobCounter(jobCountId);
        //call to the job service to add the jobs to the DB
        await this.jobService.AddJobsAsync(jobsToBeAdded).then(resp => {
          if(resp == "success"){
            this.ngxSmartModalService.close('addJobModal');//close the dialog
            this.loading.hide();
          }else{
            this.notifier.notify("error", "Error processing jobs, please try again");
            this.loading.hide();
          }
        });
    }
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
