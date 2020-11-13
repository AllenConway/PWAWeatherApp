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
  private readonly weatherDefaultZip: string = '28801';

  private getCurrentWeatherSource = new BehaviorSubject<CurrentWeather>(null);
  private getCurrentZipCodeSource = new BehaviorSubject<string>(this.weatherDefaultZip);
  public getCurrentWeather$ = this.getCurrentWeatherSource.asObservable();
  public getCurrentZipCode$ = this.getCurrentZipCodeSource.asObservable();

  constructor(private http: HttpClient) { }

  getCurrentWeather(zipCode: string) {
      const params = {
        'zip': zipCode,
        'appid': this.openWeatherAPIKey
      };
      const url: string = `${this.openWeatherBaseUrl}/weather`;
      this.http.get<CurrentWeather>(url, {params: params}).subscribe(response => {
        // this.getCurrentZipCodeSource.next(zipCode);
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
