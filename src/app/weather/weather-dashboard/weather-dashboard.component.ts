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

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    // We subscribe to the zipCode observable on initial load as a means to an end to get the default zip loaded, so only take the 1st stream
    this.subscriptions.add(this.weatherService.getCurrentZipCode$.pipe(take(1)).subscribe(data => this.onZipCodeDataLoaded(data)));
  }

  onZipCodeChanged(zipCode: string) {
    //Only make a call if the zip code was changed by the user
    if (zipCode != this.weatherZipCode) {
      this.weatherService.setWeatherZipCode(zipCode);
    }
  }

  onZipCodeDataLoaded(zipCode: string) {
    this.weatherZipCode = zipCode;
  }

}
