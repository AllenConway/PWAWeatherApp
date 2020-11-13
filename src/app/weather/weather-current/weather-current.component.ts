import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WeatherService } from '../shared/services/weather.service';

@Component({
  selector: 'app-weather-current',
  templateUrl: './weather-current.component.html',
  styleUrls: ['./weather-current.component.scss'],
})
export class WeatherCurrentComponent implements OnInit {

  private subscriptions = new Subscription()
  public weatherData: any;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.subscriptions.add(this.weatherService.getCurrentWeather$.subscribe(data => this.onGetCurrentWeather(data)));
    this.subscriptions.add(this.weatherService.getCurrentZipCode$.subscribe(data => this.onZipCodeChanged(data)));
  }

  onGetCurrentWeather(data: any) {
    this.weatherData = data;
  }

  onZipCodeChanged(zipCode: string) {
    this.weatherService.getCurrentWeather(zipCode);
  }

}
