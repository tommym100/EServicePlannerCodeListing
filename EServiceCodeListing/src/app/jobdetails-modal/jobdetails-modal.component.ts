import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HomeComponent } from '../home/home.component';

@Component({ 
  selector: 'app-jobdetails-modal',
  templateUrl: './jobdetails-modal.component.html',
  styleUrls: ['../home/home.component.scss']
})
export class JobDetailsModalComponent implements OnInit {
  constructor(
    private homeComponent: HomeComponent,
    public ngxSmartModalService: NgxSmartModalService) { }
    //vars for job details
  data = {
    JobId: "",
    Address1: "",
    Address2: "",
    JobDate: ""
  };
  driverEmployees;
  jobTitle;

  //get data and add to scope
  onOpen() {
    this.jobTitle = '';
    this.data = this.ngxSmartModalService.getModalData('jobDetailsModal');
    this.data.JobDate = new Date(this.data.JobDate).toDateString();
    this.jobTitle = this.data.JobId + " - " + this.data.Address1;
  }

  //reset modal data
  onClose() {
    this.ngxSmartModalService.resetModalData('jobDetailsModal');
  }

  //open the map modal
  showMapDiv(job){
    const myParams = job;
    this.ngxSmartModalService.setModalData(myParams, 'mapModal');
    this.ngxSmartModalService.open('mapModal');
  }

  //open employee modal
  openEmployeePopup(job) {
    this.homeComponent.loading.show();
    this.driverEmployees = this.homeComponent.driverEmployees;
      const myParams = { JobData: job, Employees: {items: this.driverEmployees}};
      this.ngxSmartModalService.setModalData(myParams, 'employeeModal');
      this.ngxSmartModalService.open('employeeModal');
      this.homeComponent.loading.hide();
  }

  //open notes modal
  openNotesPopup(job) {
      this.homeComponent.loading.show();
      this.ngxSmartModalService.setModalData(job, 'notesModal');
      this.ngxSmartModalService.open('notesModal');
      this.homeComponent.loading.hide();
  }

   //open the edit details modal on jobs
   openEditJobPopup(job) {
    this.homeComponent.loading.show();
    this.ngxSmartModalService.setModalData(job, 'editJobModal');
    this.ngxSmartModalService.open('editJobModal');
    this.homeComponent.loading.hide();
}

  //open date modal
  openDatePopup(job) {
    this.homeComponent.loading.show();
    this.ngxSmartModalService.setModalData(job, 'dateModal');
    this.ngxSmartModalService.open('dateModal');
    this.homeComponent.loading.hide();
}

  markAsComplete(job){
    this.homeComponent.markAsComplete(job);
  }

  ngOnInit() {
    this.driverEmployees = this.homeComponent.driverEmployees;
  }

}
