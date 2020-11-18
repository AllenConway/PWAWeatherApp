import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../shared/services/weather.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-weather-dashboard',
  templateUrl: './weather-dashboard.component.html',
  styleUrls: ['./weather-dashboard.component.scss'],
})
export class WeatherDashboardComponent implements OnInit {

  private subscriptions = new Subscription()
  public weatherData: any;
  public weatherZipCode: string;
  private readonly weatherZipCodeStorageKey: string = "weatherZipCode";

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    // We subscribe to the zipCode observable on initial load as a means to an end to get the default zip loaded, so only take the 1st stream
    this.subscriptions.add(this.weatherService.getCurrentZipCode$.pipe(take(1)).subscribe(data => this.onZipCodeDataLoaded(data)));
  }

  onZipCodeChanged() {
    const lastSetWeatherZipCode = localStorage.getItem(this.weatherZipCodeStorageKey);
    //Only make a call if the zip code was changed by the user
    if (this.weatherZipCode != lastSetWeatherZipCode) {
      localStorage.setItem(this.weatherZipCodeStorageKey, this.weatherZipCode);
      this.weatherService.setWeatherZipCode(this.weatherZipCode);
    }
  }

  onZipCodeDataLoaded(zipCode: string) {
    localStorage.setItem(this.weatherZipCodeStorageKey, zipCode);
    this.weatherZipCode = zipCode;
  }

}
