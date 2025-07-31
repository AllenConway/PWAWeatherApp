import { Component, OnDestroy, OnInit } from '@angular/core';
import { WeatherService } from '../shared/services/weather.service';
import { Subscription } from 'rxjs';
import { HourlyWeather } from '../shared/models';

@Component({
    selector: 'app-weather-hourly',
    templateUrl: './weather-hourly.component.html',
    styleUrls: ['./weather-hourly.component.scss'],
    standalone: false
})
export class WeatherHourlyComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription()
  private readonly weatherCityNameStorageKey: string = "weatherCityName";
  public weatherCityName: string;
  public weatherData: HourlyWeather;


  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.subscriptions.add(this.weatherService.getHourlyWeather$.subscribe(data => this.onGetHourlyWeather(data)));
    this.subscriptions.add(this.weatherService.currentWeatherTabSelected$.subscribe(data => this.onTabChangeCompleted(data)));
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private onGetHourlyWeather(data: HourlyWeather) {
    this.weatherCityName = JSON.parse(localStorage.getItem(this.weatherCityNameStorageKey));
    this.weatherData = data;
  }

  private onTabChangeCompleted(tabName: string) {
    if(tabName === 'hourly') {
      this.weatherService.getHourlyWeather();
    }
  }

}
