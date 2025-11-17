import { CurrentWeather, ForecastWeather } from '../models';

/**
 * Test data factory for creating mock forecast responses
 */
export class WeatherMockFactory {
  /**
   * Creates a forecast response with specified number of days
   * Each day has 8 intervals (3-hour intervals matching OpenWeatherMap API)
   * 
   * @param numberOfDays How many days of forecast data to generate
   * @param startDate Starting date for the forecast (defaults to known test date)
   * @returns Mock ForecastWeather object
   */
  static createForecastResponse(
    numberOfDays: number = 2,
    startDate: Date = new Date('2025-11-17T06:00:00Z')
  ): Partial<ForecastWeather> {
    const baseTimestamp = startDate.getTime() / 1000;
    const intervalsPerDay = 8;
    const intervalSeconds = 10800; // 3 hours
    const secondsPerDay = 86400; // 24 hours

    const list = [];
    
    for (let day = 0; day < numberOfDays; day++) {
      const dayOffset = day * secondsPerDay;
      
      for (let interval = 0; interval < intervalsPerDay; interval++) {
        const timestamp = baseTimestamp + dayOffset + (interval * intervalSeconds);
        const baseTemp = 70 - (day * 5); // Day 0: 70-77, Day 1: 65-72, etc.
        
        list.push({
          dt: timestamp,
          main: { temp: baseTemp + interval } as any,
          weather: [{ 
            id: day === 0 ? 800 : 500, 
            main: day === 0 ? 'Clear' : 'Rain', 
            description: day === 0 ? 'clear sky' : 'light rain', 
            icon: day === 0 ? '01d' : '10d' 
          }],
          pop: 0.1 + (day * 0.4) + (interval * 0.02)
        } as any);
      }
    }

    return { list };
  }

  /**
   * Creates a simple hourly forecast with specified number of intervals
   */
  static createHourlyForecast(intervals: number = 2): Partial<ForecastWeather> {
    return {
      list: Array.from({ length: intervals }, (_, i) => ({
        dt: 1700000000 + (i * 10800),
        main: { temp: 70 - (i * 2) } as any,
        weather: [{
          id: 800 + i,
          main: i === 0 ? 'Clear' : 'Clouds',
          description: i === 0 ? 'clear sky' : 'few clouds',
          icon: i === 0 ? '01d' : '02d'
        }]
      } as any))
    };
  }

  /**
   * Creates a mock current weather response
   */
  static createCurrentWeather(overrides?: Partial<CurrentWeather>): Partial<CurrentWeather> {
    return {
      name: 'Asheville',
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: { temp: 72, feels_like: 70, temp_min: 68, temp_max: 75, pressure: 1013, humidity: 50 },
      coord: { lat: 35.6, lon: -82.5 },
      ...overrides
    } as CurrentWeather;
  }

  /**
   * Creates a minimal current weather with just coordinates (useful for coordinate-dependent tests)
   */
  static createCurrentWeatherWithCoords(lat: number = 35.6, lon: number = -82.5): Partial<CurrentWeather> {
    return {
      coord: { lat, lon }
    } as CurrentWeather;
  }
}
