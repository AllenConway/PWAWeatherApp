import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WeatherService } from '../shared/services/weather.service';
import { CurrentWeather } from '../shared/models/current-weather.model';

@Component({
  selector: 'app-weather-current',
  templateUrl: './weather-current.component.html',
  styleUrls: ['./weather-current.component.scss'],
})
export class WeatherCurrentComponent implements OnInit {

  private subscriptions = new Subscription()
  private readonly weatherCityNameStorageKey: string = "weatherCityName";
  public weatherData: CurrentWeather;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.subscriptions.add(this.weatherService.getCurrentWeather$.subscribe(data => this.onGetCurrentWeather(data)));
  }

  onGetCurrentWeather(data: CurrentWeather) {
    localStorage.setItem(this.weatherCityNameStorageKey, JSON.stringify(data?.name));
    this.weatherData = data;
  }

}
