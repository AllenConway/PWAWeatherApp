import { Component, OnDestroy, OnInit } from '@angular/core';
import { GeonamesService } from '../shared/services/geonames.service';
import { WeatherService } from '../shared/services/weather.service';
import { Subscription } from 'rxjs';
import { SwUpdate, VersionDetectedEvent, VersionEvent, VersionReadyEvent } from '@angular/service-worker';

@Component({
    selector: 'app-weather-dashboard',
    templateUrl: './weather-dashboard.component.html',
    styleUrls: ['./weather-dashboard.component.scss'],
    standalone: false
})
export class WeatherDashboardComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription()
  public weatherData: any;
  public weatherZipCode: string;
  private readonly weatherZipCodeStorageKey: string = "weatherZipCode";

  constructor(private weatherService: WeatherService, private geonamesService: GeonamesService, private swUpdate: SwUpdate) { }

  ngOnInit() {
    // We subscribe to the zipCode observable on initial load as a means to an end to get the default zip loaded, so only take the 1st stream
    this.subscriptions.add(this.weatherService.getCurrentZipCode$.subscribe(data => this.onZipCodeDataLoaded(data)));
    // Let's keep tabs on the ServiceWorker state changes and subscribe to some of the lifecycle events
    // The service worker checks for updates during initialization and on each navigation request
    this.subscriptions.add(this.swUpdate.versionUpdates.subscribe(data => this.onSwVersionEvent(data)));
    this.subscriptions.add(this.geonamesService.getPostalCode$.subscribe(data => this.onGetPostalCodeLoaded(data)));
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onZipCodeChanged() {
    if (!this.weatherZipCode) return;
    const lastSetWeatherZipCode = JSON.parse(localStorage.getItem(this.weatherZipCodeStorageKey));
    //Only make a call if the zip code was changed by the user
    if (this.weatherZipCode != lastSetWeatherZipCode) {
      localStorage.setItem(this.weatherZipCodeStorageKey, JSON.stringify(this.weatherZipCode));
      this.weatherService.setWeatherZipCode(this.weatherZipCode);
    }
  }

  onZipCodeDataLoaded(zipCode: string) {
    localStorage.setItem(this.weatherZipCodeStorageKey, JSON.stringify(zipCode));
    this.weatherZipCode = zipCode;
    this.weatherService.getCurrentWeather(zipCode);
  }

  ionTabsDidChange($event) {
    this.weatherService.currentWeatherTabSelectedSource.next($event.tab);
  }

  useCurrentGeolocation() {
    navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      // Get the zipcode for the user's location, and update the weather
      this.geonamesService.getPostalCode(latitude, longitude);
    }, (error) => {
      alert('User does not allow geolocation access');
      // Denotes the maximum length of time that is allowed to pass from the call to 
      // getCurrentPosition() or watchPosition() until the corresponding successCallback is invoked
    }, { timeout: 10000 })  
  }

  private onGetPostalCodeLoaded(zipCode: string) {
    if(zipCode) {
      this.onZipCodeDataLoaded(zipCode);
    }
  }

  private onSwVersionEvent(eventData: VersionEvent) {
    if (this.isVersionDetectedEvent(eventData)) {
      // VersionDetectedEvent: a new version is detected on the server
      console.log('Old weather app version prior to activation: ', eventData.version.hash);
      console.log('New weather app version after activation: ', eventData.version.hash);
    }
    else if (this.isVersionReadyEvent(eventData)) {
      // VersionReadyEvent: a new version has been downloaded and is ready for activation
      // Use activateUpdate() to update the current client to the latest version
      console.log('Current weather app version: ', eventData.currentVersion.hash);
      console.log('Newest available app version: ', eventData.latestVersion.hash);
    }
  }

  // Leverage custom defined Type Guard functions
  private isVersionDetectedEvent(versionEvent: VersionDetectedEvent | VersionReadyEvent | VersionEvent): versionEvent is VersionDetectedEvent {
    return (<VersionDetectedEvent>versionEvent).version !== undefined;
  }

  private isVersionReadyEvent(versionEvent: VersionDetectedEvent | VersionReadyEvent | VersionEvent): versionEvent is VersionReadyEvent {
    return (<VersionReadyEvent>versionEvent).currentVersion !== undefined;
  }

}
