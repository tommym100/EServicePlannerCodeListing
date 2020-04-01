/* tslint:disable */
import { Injectable } from '@angular/core';
import firebase from './firebase.service';

@Injectable({
  providedIn: 'root',
})
class JobService {
  constructor(
  ) {
  }

  //set the new value for the job id
  SetJobCounter(jobCount){
    let updates = {};
    updates['/JobCount/count'] = jobCount;
    firebase.database().ref().update(updates);
  }

  //get the current value for the job id
  async getJobCounter(){ 
    const ref = firebase.database().ref("JobCount");
    const snapshot = await ref.orderByChild('count').once("value");
    const jobCount = snapshot.val() || {};
    return jobCount.count;
  }

  //call to search jobs by a specific date range
  async GetWeeklyJobsByDateAsync(dates, user, filter){
    let objArr = []; objArr['mon'] = []; objArr['tue'] = []; objArr['wed'] = []; objArr['thur'] = []; objArr['fri'] = []; objArr['sat'] = [];
    let dateFrom = dates.d1.toISOString().split("T")[0];
    let dateTo = dates.d2.toISOString().split("T")[0];
    const ref = firebase.database().ref("Jobs");
    const snapshot = await ref.orderByChild('JobDate').startAt(dateFrom).endAt(dateTo).once("value");
    const jobs = snapshot.val() || {};
    let jobsArr = [];
    Object.keys(jobs).map(function(key) {
      if(user){//limit the results if an email exists as they are not an admin
        if(jobs[key].JobEmployees && JSON.stringify(jobs[key].JobEmployees).includes(user)){
          if(filter == 'all' || jobs[key].Status == filter || jobs[key].Route == filter){
            jobsArr.push(jobs[key]);
          }
        }
      }else{
        if(filter == 'all' || jobs[key].Status == filter || jobs[key].Route == filter){
          jobsArr.push(jobs[key]);
        }
      }
    });
    //matching jobs are parsed into the correct day
    jobsArr.forEach(job => {
      job.JobDate = new Date(job.JobDate); //manipulate the date from string
      job.JobStrDate = job.JobDate.toDateString(); //manipulate the date from string
      switch (job.JobDate.getDay()) {
        case 1:
          objArr['mon'].push(job);
        break;
        case 2:
          objArr['tue'].push(job);
        break;
        case 3:
          objArr['wed'].push(job);
        break;
        case 4:
          objArr['thur'].push(job);
        break;
        case 5:
          objArr['fri'].push(job);
        break;
        case 6:
          objArr['sat'].push(job);
        break;
                    
        default:
        break;
      }
    });
    return objArr;
  };

  //call to search jobs by a specific date range - returns an array of all matching jobs
  async GetDailyJobsByDateAsync(jobDate, user, filter){
    let jobsArr = [];
    const dateToSearch = jobDate.toISOString().split("T")[0];
    const ref = firebase.database().ref("Jobs");
    const snapshot = await ref.orderByChild('JobDate').equalTo(dateToSearch).once("value");
    const jobs = snapshot.val() || {};
    Object.keys(jobs).map(function(key) {
      if(user){//limit the results if an email exists as they are not an admin
        if(jobs[key].JobEmployees && JSON.stringify(jobs[key].JobEmployees).includes(user)){
          if(filter == 'all' || jobs[key].Status == filter || jobs[key].Route == filter){
            jobsArr.push(jobs[key]);
          }
        }
      }else{
        if(filter == 'all' || jobs[key].Status == filter || jobs[key].Route == filter){
          jobsArr.push(jobs[key]);
        }
      }
    });
    jobsArr.forEach(job => {
      job.JobDate = new Date(job.JobDate); //manipulate the date from string
      job.JobStrDate = job.JobDate.toDateString(); //manipulate the date from string
    });
    return jobsArr;
  };

  //call to search all jobs by a given term and return an array or job objects
  async GetJobSearchAsync(params, user){
    let objArr = [];
    const ref = firebase.database().ref("Jobs");
    await ref.orderByChild('JobId').startAt('Job101').endAt('Job999').on('child_added', function(snapshot) { 
      let job = snapshot.val();
      job.JobDate = new Date(job.JobDate); //manipulate the date from string
      job.JobStrDate = job.JobDate.toDateString(); //manipulate the date from string
      let jobString = JSON.stringify(job).toLowerCase();
        if(jobString.includes(params.search)){
          if(user){//limit the results if an email exists as they are not an admin
            if(jobString.includes(user)){
              objArr.push(job)
            }
          }else{
            objArr.push(job)
          }
        }
    });
    return objArr;
  }

  //adds new jobs to the db
  async AddJobsAsync(jobsArr){
    let updates = {};
    for(let t = 0; t < jobsArr.length; t++){
      const newPostKey = firebase.database().ref().child('Jobs').push().key;
      jobsArr[t].id = newPostKey;
      updates['/Jobs/' + newPostKey] = jobsArr[t];
    }  
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }


  //updates jobs to the db
  async EditJobsAsync(jobArr){
    let updates = {};
    updates['/Jobs/' + jobArr.id] = jobArr;
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //deletes jobs from the db
  async DeleteJobsAsync(id){
    const remove = "/Jobs/" + id;
    return firebase.database().ref(remove).remove().then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //updates the employees assigned to a given job
  async UpdateJobEmployeesAsync(jobId, employeesArr){
    let updates = {};
    updates['/Jobs/' + jobId + "/JobEmployees"] = employeesArr;
    updates['/Jobs/' + jobId + "/Status"] = employeesArr.length > 0 ? "Assigned" : "New";
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //updates the employees assigned to a given job
  async UpdateJobStatusCompleteAsync(jobId){
    let updates = {};
    updates['/Jobs/' + jobId + "/Status"] = "Complete";
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //updates the given date for a job
  async UpdateJobDateAsync(jobObj, newDate){
    let updates = {};
    newDate = newDate.toISOString().split("T")[0];
    updates['/Jobs/' + jobObj.id + "/JobDate"] = newDate;
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }

  //adds a note to the job
  async UpdateJobNotesAsync(jobObj){
    let updates = {};
    updates['/Jobs/' + jobObj.id + "/Notes"] = jobObj.Notes;
    return firebase.database().ref().update(updates).then(resp => {
      return "success";
    }).catch(err => {
      return "error";
    });
  }
}

export { JobService }
