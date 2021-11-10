import { Component, OnDestroy, OnInit } from '@angular/core';
import { WeatherService } from '../shared/services/weather.service';
import { Subscription } from 'rxjs';
import { FutureWeather } from '../shared/models/future-weather.model';

@Component({
  selector: 'app-weather-future',
  templateUrl: './weather-future.component.html',
  styleUrls: ['./weather-future.component.scss'],
})
export class WeatherFutureComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription()
  private readonly weatherCityNameStorageKey: string = "weatherCityName";
  public weatherCityName: string;
  public weatherData: FutureWeather;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.subscriptions.add(this.weatherService.getFutureWeather$.subscribe(data => this.onGetFutureWeather(data)));
    this.subscriptions.add(this.weatherService.currentWeatherTabSelected$.subscribe(data => this.onTabChangeCompleted(data)));
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private onGetFutureWeather(data: FutureWeather) {
    this.weatherCityName = JSON.parse(localStorage.getItem(this.weatherCityNameStorageKey));
    this.weatherData = data;
  }

  private onTabChangeCompleted(tabName: string) {
    if(tabName === 'future') {
      this.weatherService.getFutureWeather();
    }
  }

}
