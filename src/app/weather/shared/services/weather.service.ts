import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CurrentWeather } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly openWeatherAPIKey: string = "e6ffd5da204bed35e83db04a083b382b";
  private readonly openWeatherBaseUrl: string = "https://api.openweathermap.org/data/2.5";
  private readonly weatherZipCodeStorageKey: string = "weatherZipCode";
  private weatherCurrentZip: string = '28801';

  private getCurrentWeatherSource = new BehaviorSubject<CurrentWeather>(null);
  private getCurrentZipCodeSource = new BehaviorSubject<string>(this.weatherCurrentZip);
  public getCurrentWeather$ = this.getCurrentWeatherSource.asObservable();
  public getCurrentZipCode$ = this.getCurrentZipCodeSource.asObservable();

  constructor(private http: HttpClient) { 
    // If a previous zip code was set in storage, go ahead and initialize BehaviorSubject with the last known value
    const lastSetWeatherZipCode = localStorage.getItem(this.weatherZipCodeStorageKey);
    if (lastSetWeatherZipCode) {
      this.getCurrentZipCodeSource.next(lastSetWeatherZipCode);
    }
  }

  getCurrentWeather(zipCode: string) {
      const params = {
        'zip': zipCode,
        'appid': this.openWeatherAPIKey
      };
      const url: string = `${this.openWeatherBaseUrl}/weather`;
      this.http.get<CurrentWeather>(url, {params: params}).subscribe(response => {
        this.weatherCurrentZip = zipCode;
        this.getCurrentWeatherSource.next(response);
      });
  }

  getHourlyWeather(zipCode: string) {

  }

  getFutureWeather(zipCode: string) {

  }

  setWeatherZipCode(zipCode: string) {
    this.getCurrentZipCodeSource.next(zipCode);
  }

}
