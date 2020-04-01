import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NotifierService } from 'angular-notifier';
import { HomeComponent } from '../home/home.component';
import { JobService } from '../api/services/job.service';

@Component({ 
  selector: 'app-employee-modal',
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent implements OnInit {
  constructor(
    private homeComponent: HomeComponent,
    private empService: JobService,
    private notifier: NotifierService,
    public ngxSmartModalService: NgxSmartModalService) { }
  //set employee vars
  data;
  jobTitle;
  avalibleEmployees = [];
  addedEmployees = [];
  empName;

    //creates the label for the display of each employee in the list
  private empNameLabel(items: any) {
    return items.firstName + '  ' + items.lastName;
  }

  //get the employee data, loop employees and create modal data to be displayed
  onOpen() {
    this.data = {};
    this.jobTitle = '';
    this.avalibleEmployees = [];
    this.addedEmployees = [];
    this.data = this.ngxSmartModalService.getModalData('employeeModal');
    this.avalibleEmployees = this.data.Employees.items;
    for (let t = 0; t < this.avalibleEmployees.length; t++) {
      this.empName = this.empNameLabel;
    }
    this.addedEmployees = this.data.JobData.JobEmployees || [];
    for (let t = 0; t < this.addedEmployees.length; t++) {
      this.avalibleEmployees.push(this.addedEmployees[t]);
      this.empName = this.empNameLabel;
    }
    this.jobTitle = this.data.JobData.JobId + " - " + this.data.JobData.Address1
  }

  //reset the data
  onClose() {
    this.ngxSmartModalService.resetModalData('employeeModal');
  }

  //update the job with the new employee array
  async onSave() {
    this.homeComponent.loading.show();
    const jobId = this.data.JobData.id;
    await this.empService.UpdateJobEmployeesAsync(jobId, this.addedEmployees).then(resp => {
      if(resp == "success"){
        this.ngxSmartModalService.close('employeeModal');//close the dialog
        this.homeComponent.ngOnInit();
        this.homeComponent.loading.hide();
      }else{
        this.notifier.notify("error", "Error processing employees, please try again");
        this.homeComponent.loading.hide();
      }
    });
  }

  ngOnInit() {
  }

}
