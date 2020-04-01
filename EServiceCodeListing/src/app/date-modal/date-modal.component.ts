import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NotifierService } from 'angular-notifier';
import { HomeComponent } from '../home/home.component';
import { JobService } from '../api/services/job.service';
import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';

@Component({ 
  selector: 'app-date-modal',
  templateUrl: './date-modal.component.html',
  styleUrls: ['./date-modal.component.scss']
})
export class DatesModalComponent implements OnInit {
  constructor(
    private homeComponent: HomeComponent,
    private notifier: NotifierService,
    private jobService: JobService,
    public ngxSmartModalService: NgxSmartModalService) { }
  //set vars for dates
  data;
  jobTitle;
  dateToAdd: Date = new Date ();
  minDate: Object = new Date();


    onRenderCell(args: RenderDayCellEventArgs): void { //disable sundays for start or finish date
      if (args.date.getDay() == 0) {
          //sets isDisabled to true to disable the date.
          args.isDisabled = true;
          //To know about the disabled date customization, you can refer in "styles.css".
      }
    }

    //when open get the data and set the date date 
  onOpen() {
    this.data = {};
    this.jobTitle = '';
    this.data = this.ngxSmartModalService.getModalData('dateModal');
    let newDate = new Date(this.data.JobDate);
    newDate.setHours(3);
    this.dateToAdd = new Date(newDate);
    this.minDate = new Date();
    this.jobTitle = this.data.JobId + " - " + this.data.Address1;
  }

  //reset the modal data on close;
  onClose() {
    this.ngxSmartModalService.resetModalData('dateModal');
  }

  //on save will add the new date tot he job and reload the jobs
  async onSave() {
    if(!this.dateToAdd){//if there is no date or invalid date
      this.notifier.notify("error", "Please select a valid date for this job");
      return;
    }
    if(this.dateToAdd.getDay() == 0){//if a Sunday is selected
      this.notifier.notify("error", "Jobs cannot be scheduled on a Sunday");
      return;
    }
    if(this.dateToAdd < new Date()){//if new date is less than old date
      this.notifier.notify("error", "Please select a date greater than today");
      return;
    }
    this.homeComponent.loading.show();
    await this.jobService.UpdateJobDateAsync(this.data, this.dateToAdd).then(resp => {
      if(resp == "success"){
        this.ngxSmartModalService.close('dateModal');
        this.homeComponent.ngOnInit();
        this.homeComponent.loading.hide();
      }else{
        this.notifier.notify("error", "Error processing update, please try again");
        this.homeComponent.loading.hide();
      }
    });
  }

  //update the date var on change
  changeDate(event){
    this.dateToAdd = event.value;
  }

  ngOnInit() {
  }

}
