import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NotifierService } from 'angular-notifier';
import { HomeComponent } from '../home/home.component';
import { JobService } from '../api/services/job.service';
import * as moment from 'moment';
import { AppComponent } from '../app.component';

@Component({ 
  selector: 'app-notes-modal',
  templateUrl: './notes-modal.component.html',
  styleUrls: ['./notes-modal.component.scss']
})
export class NotesModalComponent implements OnInit {
  constructor(
    private homeComponent: HomeComponent,
    private appComponent: AppComponent,
    private jobService: JobService,
    private notifier: NotifierService,
    public ngxSmartModalService: NgxSmartModalService) { }
  data;
  jobTitle;
  noteToAdd = "";

  //open the modal and set the title 
  onOpen() {
    this.data = {};
    this.jobTitle = '';
    this.noteToAdd = "";
    this.data = this.ngxSmartModalService.getModalData('notesModal');
    this.jobTitle = this.data.JobId ? this.data.JobId + " - " + this.data.Address1 : this.data.newNote;
  }

  //close and reset the modal data
  onClose() {
    this.ngxSmartModalService.resetModalData('notesModal');
  }

  //build the note object and save it to the job
  async onSave() {
    this.homeComponent.loading.show();
    if(!this.noteToAdd){
      this.ngxSmartModalService.close('notesModal');
      this.homeComponent.loading.hide();
      return;
    }
    let nowDate = new Date();
     //get the dat in the correct format
    let formateNowDate = moment(nowDate).format("DD/MM/YYYY - HH:mm");
    //build the object
    const noteObj = {
      name: this.appComponent.getUser(),
      dateTime: formateNowDate,
      note: this.noteToAdd
    }
    //if there are no notes, create an object array
    if(!this.data.Notes){
      this.data["Notes"] = [];
    }
    // push the object tot he array
    this.data.Notes.push(noteObj);
    //call the service to update the job
    await this.jobService.UpdateJobNotesAsync(this.data).then(resp => {
      if(resp == "success"){
        this.ngxSmartModalService.close('notesModal');
        this.homeComponent.ngOnInit();
        this.homeComponent.loading.hide();
      }else{
        this.notifier.notify("error", "Error processing notes, please try again");
        this.homeComponent.loading.hide();
      }
    });
  }

  ngOnInit() {
  }

}
