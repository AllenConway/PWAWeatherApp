import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CurrentWeather, ForecastWeather, FutureWeather, HourlyWeather, Weather } from '../models';

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
    const lastSetWeatherZipCode = JSON.parse(localStorage.getItem(this.weatherZipCodeStorageKey));
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
      this.http.get<CurrentWeather>(url, {params: params}).subscribe({
        next: (response) => {
          this.weatherCurrentZip = zipCode;
          if (response) {
            response?.weather.forEach(item => {
              // Convert icon code to full URL for template display
              item.icon = `https://openweathermap.org/img/wn/${item.icon}@2x.png`
            });
          }
          this.getCurrentWeatherSource.next(response);
        },
        error: (error) => {
          console.error('Error fetching current weather:', error);
        }
      });
  }

  getHourlyWeather() {
    let latitude: number;
    let longitude: number;
    const currentWeather = this.getCurrentWeather$.subscribe(weather => {
      latitude = weather?.coord.lat;
      longitude = weather?.coord.lon;

      // Guard against undefined coordinates
      if (latitude === undefined || longitude === undefined) {
        console.error('Cannot fetch hourly weather: missing coordinates');
        return;
      }

      const params = {
        'lat': latitude.toString(),
        'lon': longitude.toString(),
        'units': 'imperial',
        'appid': this.openWeatherAPIKey
      };
  
      const url: string = `${this.openWeatherBaseUrl}/forecast`;
      this.http.get<ForecastWeather>(url, {params: params}).subscribe(response => {
        if (response) {
          const hourlyData = this.transformToHourlyWeather(response);
          this.getHourlyWeatherSource.next(hourlyData);
        }
      });
    });
  }

  getFutureWeather() {
    let latitude: number;
    let longitude: number;
    const currentWeather = this.getCurrentWeather$.subscribe(weather => {
      latitude = weather?.coord.lat;
      longitude = weather?.coord.lon;

      // Guard against undefined coordinates
      if (latitude === undefined || longitude === undefined) {
        console.error('Cannot fetch future weather: missing coordinates');
        return;
      }

      const params = {
        'lat': latitude.toString(),
        'lon': longitude.toString(),
        'units': 'imperial',
        'appid': this.openWeatherAPIKey
      };

      const url: string = `${this.openWeatherBaseUrl}/forecast`;
      this.http.get<ForecastWeather>(url, {params: params}).subscribe(response => {
        if (response) {
          const futureData = this.transformToFutureWeather(response);
          this.getFutureWeatherSource.next(futureData);
        }
      });
    });
  }

  private transformToHourlyWeather(response: ForecastWeather): HourlyWeather {
    return {
      forecast: response.list.map(item => ({
        dt: item.dt,
        temp: item.main.temp,
        weather: item.weather.map(w => ({
          ...w,
          // Convert icon code to full URL for template display
          icon: `https://openweathermap.org/img/wn/${w.icon}@2x.png`
        }))
      }))
    };
  }

  /**
   * Transforms OpenWeatherMap 5-day forecast API response into daily weather summaries.
   * 
   * Note: The free OpenWeatherMap /forecast API only provides 3-hour interval forecasts 
   * (40 data points = 8 intervals per day × 5 days), NOT true daily forecasts like the 
   * now paid onecall API. We must aggregate these intervals to create meaningful daily summaries.
   * 
   * Calculation logic:
   * - Temperature: We need actual daily min/max from all 8 intervals, not just one time point
   * - Weather condition: Must find most representative condition (not midnight or random time)
   * - Precipitation: Show peak chance users might encounter during the day
   * - Icon: Convert API codes to full URLs for template display
   * 
   * @param response OpenWeatherMap forecast API response with 40 3-hour interval forecasts
   * @returns FutureWeather object with daily summaries suitable for template consumption
   */
  private transformToFutureWeather(response: ForecastWeather): FutureWeather {
    // Transform 3-hour forecast intervals into daily summaries
    
    // Step 1: Group the 40 forecast items (8 per day × 5 days) by calendar date
    const dailyGroups = new Map<string, any[]>();
    
    response.list.forEach(item => {
      // Extract the calendar date from the Unix timestamp
      // item.dt is seconds since epoch, multiply by 1000 to get milliseconds for JavaScript Date
      // toDateString() gives us "Mon Aug 05 2025" format - this groups all forecasts for the same day
      const date = new Date(item.dt * 1000).toDateString();
      
      // Check if we've seen this date before in our grouping map
      if (!dailyGroups.has(date)) {
        // First time seeing this date - create an empty array to hold all forecasts for this day
        dailyGroups.set(date, []);
      }
      
      // Add this 3-hour forecast to the array for its corresponding day
      // After this loop, we'll have something like:
      // "Mon Aug 05 2025" -> [forecast1, forecast2, forecast3, forecast4, forecast5, forecast6, forecast7, forecast8]
      // "Tue Aug 06 2025" -> [forecast1, forecast2, forecast3, forecast4, forecast5, forecast6, forecast7, forecast8]
      // etc...
      dailyGroups.get(date)!.push(item);
    });

    // Step 2: Create daily summary from each group of 3-hour intervals
    const dailyData = Array.from(dailyGroups.entries()).map(([date, items]) => {
      // Extract all temperatures for this day to find min/max
      const temps = items.map(item => item.main.temp);
      
      // Get the most representative weather condition for the day
      const representativeWeather = this.getMostCommonWeatherCondition(items);
      
      return {
        dt: items[0].dt, // Use timestamp from first forecast of the day for date display
        temp: {
          // Calculate actual daily temperature range from all intervals
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps))
        },
        weather: [{
          // Use most common weather condition (most representative of daily weather)
          ...representativeWeather,
          // Convert icon code to full URL for template display
          icon: `https://openweathermap.org/img/wn/${representativeWeather.icon}@2x.png`
        }],
        // Use highest precipitation probability from all intervals of the day
        pop: Math.max(...items.map(item => item.pop))
      };
    });

    return {
      daily: dailyData
    };
  }

  /**
   * Determines the most common weather condition from a day's worth of 3-hour forecasts.
   * This provides a better daily summary than using a single time point, as weather
   * can vary significantly throughout the day.
   * 
   * @param items Array of forecast items for a single day (typically 8 items, one every 3 hours)
   * @returns The weather condition that appears most frequently during the day
   */
  private getMostCommonWeatherCondition(items: any[]): Weather {
    // Count occurrences of each weather condition by ID
    const weatherCounts = new Map<string, { count: number; weather: Weather }>();
    
    items.forEach(item => {
      const weatherId = item.weather[0].id.toString();
      if (!weatherCounts.has(weatherId)) {
        weatherCounts.set(weatherId, { 
          count: 0, 
          weather: item.weather[0] 
        });
      }
      weatherCounts.get(weatherId)!.count++;
    });
    
    // Find the weather condition with the highest count
    const mostCommonEntry = Array.from(weatherCounts.values())
      .sort((a, b) => b.count - a.count)[0];
    
    // Return the weather object, or fallback to first item if something goes wrong
    return mostCommonEntry?.weather || items[0]?.weather[0];
  }

  setWeatherZipCode(zipCode: string) {
    this.getCurrentZipCodeSource.next(zipCode);
  }

}
