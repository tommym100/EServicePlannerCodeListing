import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '../loading/loading.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MapViewComponent } from '../map-view/map-view.component';
import { JobService } from '../api/services/job.service';
import { AppComponent } from '../app.component';
import { EmployeeService } from '../api/services/emp.service';
import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { NotifierService } from 'angular-notifier';

declare global {
  interface Window { homeReload: any; }
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(LoadingComponent) 
  loading: LoadingComponent;
  mapView: MapViewComponent;
  constructor(
    private router: Router,
    private notifier: NotifierService,
    private appComponent: AppComponent,
    private jobService: JobService,
    private empService: EmployeeService,
    public ngxSmartModalService: NgxSmartModalService
  ) {
  }
  //set vars for home page
  public dateValue: Date = new Date ();
  date = new Date();
  jobsLoaded = false;
  weeks = [];
  years = [];
  dateSelected = {
    currentDate: '',
    dailySelected: true,
    weeklySelected: false
  };
  driverEmployees = [];
  jobsToday = [];
  jobsThisWeek = []; 
  jobsMonday = [];
  jobsTuesday = [];
  jobsWednesday = [];
  jobsThursday = [];
  jobsFriday = [];
  jobsSaturday = [];
  currentWeek = '';
  currentWeekName = '';
  currentYear = '';
  weekId = '';
  selectedWeek;
  showMap = false;
  showYearMenu = false;
  userType = "";
  isAdmin = null;
  driverToSearch = null;
  jobFilter = "all";
  reload = false;

  //disable sundays for start or finish date
  onRenderCell(args: RenderDayCellEventArgs): void { 
    if (args.date.getDay() == 0) {
        //sets isDisabled to true to disable the date.
        args.isDisabled = true;
        //To know about the disabled date customization, you can refer in "styles.css".
    }
  }

  //add zero to dates if needed
  addZero(value){
    if(value < 10){
      return "0" + value;
    }else{
      return value;
    }
  }

  //build the date string for the title from a given date
  getDailyDateString(value){
    if(value){
      this.dateValue = value;
      const dayNum = this.dateValue.getDay();
      let day;
      switch (dayNum) { case 0: day = "Sunday"; break; case 1: day = "Monday"; break; case 2: day = "Tuesday"; break; case 3: day = "Wednesday"; break; case 4: day = "Thursday"; break; case 5: day = "Friday"; break; case 6: day = "Saturday"; break; default: day = ''; break; }
      let dayDate = this.dateValue.getDate();
      let monthDate = this.dateValue.getMonth() + 1;
      dayDate = this.addZero(dayDate);
      monthDate = this.addZero(monthDate);
      let yearDate = this.dateValue.getFullYear();
      this.dateSelected.currentDate = day + " - " + dayDate + "/" + monthDate + "/" + yearDate;
    }
  }

  //build the date string for the title from a given date range
  getWeeklyDateString(value){
    let monday = new Date(value);
    if(value){
      this.dateValue = value;
      monday.setDate(value.getDate() - value.getDay() + 1)
      let saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5)
      //monday date
      let mondayDate = monday.getDate();
      let mondayMonth = monday.getMonth() + 1;
      mondayDate = this.addZero(mondayDate);
      mondayMonth = this.addZero(mondayMonth);
      //saturday date
      let saturdayDate = saturday.getDate();
      let saturdayMonth = saturday.getMonth() + 1;
      saturdayDate = this.addZero(saturdayDate);
      saturdayMonth = this.addZero(saturdayMonth);
      //get the year for the second half of date
      let yearDate = saturday.getFullYear();
      //set the date string
      this.dateSelected.currentDate =  mondayDate + "/" + mondayMonth + " - " + saturdayDate + "/" + saturdayMonth + " (" + yearDate + ")";
    }
  }

  //when selecting a date on the calendar, this builds an object containg the monday and saturday of that week
  getWeeklyDates(value){
    let monday = new Date(value);
    if(value){
      this.dateValue = value;
      monday.setDate(value.getDate() - value.getDay() + 1);
      let saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5);
      return{d1: monday, d2: saturday};
      }
  }

  //update the selected date, date string and which jobs are loaded on change
  async changeDate(event){
    if(event.value){
      if(this.dateSelected.weeklySelected){
        this.getWeeklyDateString(event.value);
        let jobDates = this.getWeeklyDates(event.value);
        this.jobsThisWeek = await this.jobService.GetWeeklyJobsByDateAsync(jobDates, this.driverToSearch, this.jobFilter); this.jobsMonday = this.jobsThisWeek["mon"]; this.jobsTuesday = this.jobsThisWeek["tue"]; this.jobsWednesday = this.jobsThisWeek["wed"]; this.jobsThursday = this.jobsThisWeek["thur"]; this.jobsFriday = this.jobsThisWeek["fri"]; this.jobsSaturday = this.jobsThisWeek["sat"];
      }else{
        this.getDailyDateString(event.value);
        this.jobsToday = await this.jobService.GetDailyJobsByDateAsync(event.value, this.driverToSearch, this.jobFilter);
      }
    }
  }

  //change job filter 
  changeJobFilter(event){
    this.jobFilter = event.target.value;
    this.ngOnInit()
  }

  //open the map component and pass in the job details
  showMapDiv(job){
    const myParams = job;
    this.ngxSmartModalService.setModalData(myParams, 'mapModal');
    this.ngxSmartModalService.open('mapModal');
  }

  //change to daily view
  async showDaily(){
    if(!this.dateSelected.dailySelected){
      this.jobsToday = await this.jobService.GetDailyJobsByDateAsync(this.dateValue, this.driverToSearch, this.jobFilter);
      this.getDailyDateString(this.dateValue);
      this.dateSelected.dailySelected = !this.dateSelected.dailySelected;
      this.dateSelected.weeklySelected = !this.dateSelected.weeklySelected;
    }
  }
  
  //change to weekly view
  async showWeekly(){
    if(!this.dateSelected.weeklySelected){
      let jobDates = this.getWeeklyDates(this.dateValue);
      this.jobsThisWeek = await this.jobService.GetWeeklyJobsByDateAsync(jobDates, this.driverToSearch, this.jobFilter); this.jobsMonday = this.jobsThisWeek["mon"]; this.jobsTuesday = this.jobsThisWeek["tue"]; this.jobsWednesday = this.jobsThisWeek["wed"]; this.jobsThursday = this.jobsThisWeek["thur"]; this.jobsFriday = this.jobsThisWeek["fri"]; this.jobsSaturday = this.jobsThisWeek["sat"];
      this.getWeeklyDateString(this.dateValue);
      this.dateSelected.weeklySelected = !this.dateSelected.weeklySelected;
      this.dateSelected.dailySelected = !this.dateSelected.dailySelected;
    }
  }

  //update jo status
  async markAsComplete(job){
    this.loading.show();
    const jobId = job.id;
    await this.jobService.UpdateJobStatusCompleteAsync(jobId).then(resp => {
      if(resp == "success"){
        this.ngOnInit();
        this.loading.hide();
      }else{
        this.notifier.notify("error", "Error processing status update, please refresh and try again");
        this.loading.hide();
      }
    });
  }

  //display add employee to job modal
  openEmployeePopup(job) {
    this.loading.show();
      const myParams = { JobData: job, Employees: {items: this.driverEmployees}};
      this.ngxSmartModalService.setModalData(myParams, 'employeeModal');
      this.ngxSmartModalService.open('employeeModal');
      this.loading.hide();
  }

  //display the add note to job modal
  openNotesPopup(job) {
      this.loading.show();
      this.ngxSmartModalService.setModalData(job, 'notesModal');
      this.ngxSmartModalService.open('notesModal');
      this.loading.hide();
  }

  //open the view details modal on weekly jobs
  openJobDetailsPopup(job) {
      this.loading.show();
      job.isAdmin = this.isAdmin;
      this.ngxSmartModalService.setModalData(job, 'jobDetailsModal');
      this.ngxSmartModalService.open('jobDetailsModal');
      this.loading.hide();
  }

  //open the edit details modal on jobs
  openEditJobPopup(job) {
      this.loading.show();
      job.isAdmin = this.isAdmin;
      this.ngxSmartModalService.setModalData(job, 'editJobModal');
      this.ngxSmartModalService.open('editJobModal');
      this.loading.hide();
  }

  //open the change job date modal
  openDatePopup(job) {
      this.loading.show();
      this.ngxSmartModalService.setModalData(job, 'dateModal');
      this.ngxSmartModalService.open('dateModal');
      this.loading.hide();
  }

  //on load, render the jobs and data for the app
  async ngOnInit() {
    this.loading.show();
    if(!this.reload){
      this.userType = this.appComponent.getUserType(); //get user type
      this.isAdmin = this.appComponent.getAdmin(); //check if admin - return bool
      if(this.isAdmin == null){//if no response from isAdmin - try again every 0.5 sec as the API may not have loaded yet
        setTimeout( () => this.ngOnInit(), 500);
        return;
       }
      //check to see if Sunday and load Monday instead
      let day = this.dateValue.getDay();
      if(day == 0){
        this.dateValue = new Date(this.dateValue.setDate(this.dateValue.getDate() + 1));
      }
      //check user type to display weekly or daily on load
      if (this.userType == "Field"){
        this.driverToSearch = this.appComponent.getUser();
        this.dateSelected.weeklySelected = false;
        this.dateSelected.dailySelected = true;
      } else{
        this.dateSelected.weeklySelected = true;
        this.dateSelected.dailySelected = false
      }      
    }

    //get the weekly or daily jobs depending which is selected
    if(this.dateSelected.weeklySelected){
      const jobDates = this.getWeeklyDates(this.dateValue);
      this.jobsThisWeek = await this.jobService.GetWeeklyJobsByDateAsync(jobDates, this.driverToSearch, this.jobFilter); this.jobsMonday = this.jobsThisWeek["mon"]; this.jobsTuesday = this.jobsThisWeek["tue"]; this.jobsWednesday = this.jobsThisWeek["wed"]; this.jobsThursday = this.jobsThisWeek["thur"]; this.jobsFriday = this.jobsThisWeek["fri"]; this.jobsSaturday = this.jobsThisWeek["sat"];
      this.getWeeklyDateString(this.dateValue);
    }else{
      this.jobsToday = await this.jobService.GetDailyJobsByDateAsync(this.dateValue, this.driverToSearch, this.jobFilter);
    }
    this.driverEmployees = await this.empService.GetDriversAsync();//get drivers for employee jobs
    this.jobsLoaded = true; 
    this.reload = true;
    this.loading.hide();
  }

}
