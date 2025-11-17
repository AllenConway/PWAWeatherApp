import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CurrentWeather, ForecastWeather } from '../models';
import { WeatherMockFactory } from './weather.service.spec.helpers';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;
  const mockZipCode = '28801';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather and emit to observable (positive path)', (done) => {
      const mockResponse = WeatherMockFactory.createCurrentWeather();

      service.getCurrentWeather$.subscribe(weather => {
        if (weather) {
          expect(weather.name).toBe('Asheville');
          expect(weather.weather[0].icon).toBe('https://openweathermap.org/img/wn/01d@2x.png');
          expect(weather.main.temp).toBe(72);
          done();
        }
      });

      service.getCurrentWeather(mockZipCode);

      const req = httpMock.expectOne(request => request.url.includes('/weather'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('zip')).toBe(mockZipCode);
      expect(req.request.params.get('units')).toBe('imperial');
      req.flush(mockResponse);
    });

    it('should handle API error gracefully (negative path)', () => {
      service.getCurrentWeather(mockZipCode);

      const req = httpMock.expectOne(request => request.url.includes('/weather'));
      req.error(new ProgressEvent('Network error'), { status: 404, statusText: 'Not Found' });

      // Service should not crash on error
      expect(service).toBeTruthy();
    });
  });

  describe('getHourlyWeather', () => {
    it('should fetch and transform hourly weather data (positive path)', (done) => {
      const mockCurrentWeather = WeatherMockFactory.createCurrentWeatherWithCoords();
      const mockForecastResponse = WeatherMockFactory.createHourlyForecast(2);

      // First emit current weather
      service['getCurrentWeatherSource'].next(mockCurrentWeather as CurrentWeather);

      service.getHourlyWeather$.subscribe(hourly => {
        expect(hourly.forecast.length).toBe(2);
        expect(hourly.forecast[0].temp).toBe(70);
        expect(hourly.forecast[0].weather[0].icon).toContain('https://openweathermap.org');
        expect(hourly.forecast[1].temp).toBe(68);
        done();
      });

      service.getHourlyWeather();

      const req = httpMock.expectOne(request => request.url.includes('/forecast'));
      expect(req.request.params.get('lat')).toBe('35.6');
      expect(req.request.params.get('lon')).toBe('-82.5');
      req.flush(mockForecastResponse);
    });

    it('should handle missing current weather data (negative path)', (done) => {
      service['getCurrentWeatherSource'].next(null);

      service.getHourlyWeather();

      // Give async operations time to complete
      setTimeout(() => {
        httpMock.expectNone(request => request.url.includes('/forecast'));
        // Verify no HTTP request was made due to guard
        expect(true).toBe(true); // Explicit expectation to avoid warning
        done();
      }, 100);
    });
  });

  describe('getFutureWeather', () => {
    it('should fetch and transform future weather data (positive path)', (done) => {
      const mockCurrentWeather = WeatherMockFactory.createCurrentWeatherWithCoords();
      const mockForecastResponse = WeatherMockFactory.createForecastResponse(2);

      service['getCurrentWeatherSource'].next(mockCurrentWeather as CurrentWeather);

      service.getFutureWeather$.subscribe(future => {
        expect(future.daily.length).toBe(2);
        
        // Check both days have valid data (order may vary based on Map iteration)
        future.daily.forEach(day => {
          expect(day.temp.min).toBeGreaterThan(0);
          expect(day.temp.max).toBeGreaterThan(day.temp.min);
          expect(day.pop).toBeGreaterThan(0);
          expect(day.weather[0].icon).toContain('https://openweathermap.org');
        });
        
        done();
      });

      service.getFutureWeather();

      const req = httpMock.expectOne(request => request.url.includes('/forecast'));
      req.flush(mockForecastResponse);
    });
  });

  describe('setWeatherZipCode', () => {
    it('should update zip code observable (positive path)', (done) => {
      const newZipCode = '90210';

      service.getCurrentZipCode$.subscribe(zipCode => {
        if (zipCode === newZipCode) {
          expect(zipCode).toBe(newZipCode);
          done();
        }
      });

      service.setWeatherZipCode(newZipCode);
    });
  });

  describe('localStorage integration', () => {
    it('should initialize with stored zip code if available', (done) => {
      const storedZip = '12345';
      localStorage.setItem('weatherZipCode', JSON.stringify(storedZip));

      // Recreate TestBed to get a fresh service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [],
        providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
      });
      
      const newService = TestBed.inject(WeatherService);

      newService.getCurrentZipCode$.subscribe(zipCode => {
        expect(zipCode).toBe(storedZip);
        done();
      });
    });

    it('should use default zip code when no stored value exists', (done) => {
      service.getCurrentZipCode$.subscribe(zipCode => {
        expect(zipCode).toBe('28801');
        done();
      });
    });
  });
});
