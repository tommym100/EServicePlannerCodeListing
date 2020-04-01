import { Component, HostListener, ElementRef } from '@angular/core';
import { SearchService } from '../services/search.service';
import { Subject } from 'rxjs/Subject';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SearchService]
})
export class SearchComponent {
    results = [];
    searchTerm = '';
    searchTerm$ = new Subject<string>();
  @HostListener('document:click', ['$event'])
  
  //if user clicks outside of the search area, the search is cleared and results hidden
  clickout(event) {
    if (this.eRef.nativeElement.contains(event.target)) {//if inside, continue
    } else {
      this.results = [];//clear results
      this.searchTerm = '';//clear input field
      this.searchTerm$.next(null);//flush the search service
    }
  }

  constructor(
    private searchService: SearchService,
    private eRef: ElementRef,
    public homeComponent: HomeComponent
  ) {
    //if search term meets criteria this subscriber will wait for the results and display them int he list
    this.searchService.search(this.searchTerm$)
      .subscribe((response: any) => {
        this.results = response;
      });
  }

  //check the input and only trigger a search after three chars
  triggerSearch(value) {
    if (value.length >= 3) {
      this.searchTerm$.next(value);
    } else {
      this.results = [];
    }
  }

  //on click of a search result will open the job int he view job details modal
  openJob(job) {
    this.results = [];
    this.searchTerm = '';
    this.homeComponent.openJobDetailsPopup(job)
  }
}
