import { Component, OnDestroy, OnInit } from '@angular/core';
import { GeonamesService } from '../shared/services/geonames.service';
import { WeatherService } from '../shared/services/weather.service';
import { Subscription } from 'rxjs';
import { SwUpdate, UpdateActivatedEvent, UpdateAvailableEvent } from '@angular/service-worker';
import { Encoding, Filesystem } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-weather-dashboard',
  templateUrl: './weather-dashboard.component.html',
  styleUrls: ['./weather-dashboard.component.scss'],
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
    this.subscriptions.add(this.swUpdate.activated.subscribe(data => this.onSwActivated(data)));
    this.subscriptions.add(this.swUpdate.available.subscribe(data => this.onSwUpdateAvailable(data)));
    this.subscriptions.add(this.geonamesService.getPostalCode$.subscribe(data => this.onGetPostalCodeLoaded(data)));
    //this.readFileWeatherData();
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

  async useCurrentGeolocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    const latitude = coordinates.coords.latitude;
    const longitude = coordinates.coords.longitude;
    // Get the zipcode for the user's location, and update the weather
    this.geonamesService.getPostalCode(latitude, longitude);
  }

  private onGetPostalCodeLoaded(zipCode: string) {
    if(zipCode) {
      this.onZipCodeDataLoaded(zipCode);
    }
  }

  private onSwActivated(data: UpdateActivatedEvent) {
    console.log('Old weather app version prior to activation: ', data.previous.hash);
    console.log('New weather app version after activation: ', data.current.hash);
  }

  private onSwUpdateAvailable(data: UpdateAvailableEvent) {
    console.log('Current weather app version: ', data.current.hash);
    console.log('Newest available app version: ', data.available.hash);
    this.swUpdate.activateUpdate(); //.then(() => document.location.reload());  ensure we don't break Lazy Loading and reload the page
  }

  private async readFileWeatherData() {
    const contents = await Filesystem.readFile({
      path: 'download\weather.txt',
      encoding: Encoding.UTF8,
    });
    alert(contents);
    console.log('data:', contents);
  }

}
