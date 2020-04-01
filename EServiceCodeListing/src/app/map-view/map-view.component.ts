/// <reference path="../../../node_modules/@types/googlemaps/index.d.ts"/>
import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';


@Component({
  selector: 'app-map',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent {  
  @ViewChild('gmap') 
  gmapElement: any;
  map: google.maps.Map;
  constructor(public ngxSmartModalService: NgxSmartModalService) { }
  jobTitle;

  //gets the modal data, builds the title and the properties for the map
  onOpen() {
    let data = this.ngxSmartModalService.getModalData('mapModal');
    this.jobTitle = data.JobId + " - " + data.Address1
    const mapProp = {
      center: new google.maps.LatLng(data.lat, data.lng),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  //close and reset modal data
  onClose(){
    this.ngxSmartModalService.resetModalData('mapModal');
  }

  //navigates tyhe user to googlemaps with directions from their current location to the job
  getDirections(){
    const jobData = this.ngxSmartModalService.getModalData('mapModal');
    const latLng = jobData.lat + "+" + jobData.lng;
    const url = "https://www.google.com/maps/dir/?api=1&origin=" + "&destination=" + latLng + "&travelmode=driving";
    url.split(' ').join('+');
    window.open(url, '_blank');
  }

  ngOnInit() {
  }
}