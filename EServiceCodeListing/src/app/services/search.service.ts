import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import {JobService} from "../api/services/job.service";
import {HomeComponent} from "../home/home.component";

@Injectable()
export class SearchService {

    constructor(
        public jobService: JobService,
        public homeComponent: HomeComponent
    ) { }

    //monitors the search bar and only runs a check every 400ms then calls the search function
    search(terms: Observable<string>) {
        return terms.debounceTime(400).distinctUntilChanged().switchMap(term => this.searchEntries(term));
    }

    // calls to firebase to check for jobs matching the criteria
    async searchEntries(term) {
        const obj = {
            search: term,
        };
        const data = await this.jobService.GetJobSearchAsync(obj, this.homeComponent.driverToSearch);
        return data;
    }
}
