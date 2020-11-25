import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CurrentWeather, FutureWeather, HourlyWeather } from '../models';
import { first, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly openWeatherAPIKey: string = "e6ffd5da204bed35e83db04a083b382b";
  private readonly openWeatherBaseUrl: string = "https://api.openweathermap.org/data/2.5";
  private readonly weatherZipCodeStorageKey: string = "weatherZipCode";
  private weatherCurrentZip: string = '28801';

  public currentWeatherTabSelectedSource = new Subject<string>();
  public currentWeatherTabSelected$ = this.currentWeatherTabSelectedSource.asObservable();

  private getCurrentWeatherSource = new BehaviorSubject<CurrentWeather>(null);
  private getCurrentZipCodeSource = new BehaviorSubject<string>(this.weatherCurrentZip);
  private getHourlyWeatherSource = new Subject<HourlyWeather>();
  private getFutureWeatherSource = new Subject<FutureWeather>();
  public getCurrentWeather$ = this.getCurrentWeatherSource.asObservable();
  public getCurrentZipCode$ = this.getCurrentZipCodeSource.asObservable();
  public getHourlyWeather$ = this.getHourlyWeatherSource.asObservable();
  public getFutureWeather$ = this.getFutureWeatherSource.asObservable();

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
        'units': 'imperial',
        'appid': this.openWeatherAPIKey
      };
      const url: string = `${this.openWeatherBaseUrl}/weather`;
      this.http.get<CurrentWeather>(url, {params: params}).subscribe(response => {
        this.weatherCurrentZip = zipCode;
        if (response) {
          response?.weather.forEach(item => {
            item.icon = `https://openweathermap.org/img/wn/${item.icon}@2x.png`
          });
        }
        this.getCurrentWeatherSource.next(response);
      });
  }

  getHourlyWeather() {
    // We need the lat/long values from the current weather to use for the Hourly call, so extract those 1st
    // Current weather is set initially, so there will be current information once this function is called
    let latitude: number;
    let longitude: number;
    const currentWeather = this.getCurrentWeather$.subscribe(weather => {
      latitude = weather?.coord.lat;
      longitude = weather?.coord.lon;

      const params = {
        'lat': latitude.toString(),
        'lon': longitude.toString(),
        'exclude': 'current,minutely,daily,alerts',
        'units': 'imperial',
        'appid': this.openWeatherAPIKey
      };
  
      const url: string = `${this.openWeatherBaseUrl}/onecall`;
      this.http.get<HourlyWeather>(url, {params: params}).subscribe(response => {
        if (response) {
          response?.hourly.forEach(item => {          
            item.weather[0].icon = `https://openweathermap.org/img/wn/${item?.weather[0]?.icon}@2x.png`
          });
        }
        this.getHourlyWeatherSource.next(response);
      });
    });

  }

  getFutureWeather() {
    // We need the lat/long values from the current weather to use for the Hourly call, so extract those 1st
    // Current weather is set initially, so there will be current information once this function is called
    let latitude: number;
    let longitude: number;
    const currentWeather = this.getCurrentWeather$.subscribe(weather => {
      latitude = weather?.coord.lat;
      longitude = weather?.coord.lon;

      const params = {
        'lat': latitude.toString(),
        'lon': longitude.toString(),
        'exclude': 'current,minutely,hourly,alerts',
        'units': 'imperial',
        'appid': this.openWeatherAPIKey
      };

      const url: string = `${this.openWeatherBaseUrl}/onecall`;
      this.http.get<FutureWeather>(url, {params: params}).subscribe(response => {
        if (response) {
          response?.daily.forEach(item => {
            item.weather[0].icon = `https://openweathermap.org/img/wn/${item?.weather[0]?.icon}@2x.png`
          });
        }
        this.getFutureWeatherSource.next(response);
      });

    });
  }

  setWeatherZipCode(zipCode: string) {
    this.getCurrentZipCodeSource.next(zipCode);
  }

}
