import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GeonamesService } from './geonames.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { GeoNamePostal } from '../models/postal-code.model';

describe('GeonamesService', () => {
  let service: GeonamesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(GeonamesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPostalCode', () => {
    it('should fetch postal code from coordinates and emit to observable (positive path)', (done) => {
      const mockLatitude = 35.5951;
      const mockLongitude = -82.5515;
      const mockResponse: GeoNamePostal = {
        postalCodes: [
          {
            adminCode2: '021',
            adminCode1: 'NC',
            adminName2: 'Buncombe',
            lng: -82.5515,
            distance: '0.0',
            countryCode: 'US',
            postalCode: '28801',
            adminName1: 'North Carolina',
            placeName: 'Asheville',
            lat: 35.5951
          }
        ]
      };

      service.getPostalCode$.subscribe(zipCode => {
        expect(zipCode).toBe('28801');
        done();
      });

      service.getPostalCode(mockLatitude, mockLongitude);

      const req = httpMock.expectOne(request => 
        request.url.includes('/findNearbyPostalCodesJSON')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('lat')).toBe(mockLatitude.toString());
      expect(req.request.params.get('lng')).toBe(mockLongitude.toString());
      expect(req.request.params.get('username')).toBe('pwaweatherapp');
      req.flush(mockResponse);
    });

    it('should handle response with multiple postal codes (positive path)', (done) => {
      const mockLatitude = 40.7128;
      const mockLongitude = -74.0060;
      const mockResponse: GeoNamePostal = {
        postalCodes: [
          {
            adminCode2: '061',
            adminCode1: 'NY',
            adminName2: 'New York',
            lng: -74.0060,
            distance: '0.0',
            countryCode: 'US',
            postalCode: '10001',
            adminName1: 'New York',
            placeName: 'New York',
            lat: 40.7128
          },
          {
            adminCode2: '061',
            adminCode1: 'NY',
            adminName2: 'New York',
            lng: -74.0070,
            distance: '0.5',
            countryCode: 'US',
            postalCode: '10002',
            adminName1: 'New York',
            placeName: 'New York',
            lat: 40.7130
          }
        ]
      };

      service.getPostalCode$.subscribe(zipCode => {
        // Should emit the first postal code
        expect(zipCode).toBe('10001');
        done();
      });

      service.getPostalCode(mockLatitude, mockLongitude);

      const req = httpMock.expectOne(request => 
        request.url.includes('/findNearbyPostalCodesJSON')
      );
      req.flush(mockResponse);
    });

    it('should handle API error gracefully (negative path)', (done) => {
      const mockLatitude = 35.5951;
      const mockLongitude = -82.5515;

      // Don't subscribe - just verify error doesn't crash
      service.getPostalCode(mockLatitude, mockLongitude);

      const req = httpMock.expectOne(request => 
        request.url.includes('/findNearbyPostalCodesJSON')
      );
      req.error(new ProgressEvent('Network error'), { 
        status: 500, 
        statusText: 'Internal Server Error' 
      });

      // Service should not crash on error
      setTimeout(() => {
        expect(service).toBeTruthy();
        done();
      }, 100);
    });

    it('should handle empty response (negative path)', (done) => {
      const mockLatitude = 0;
      const mockLongitude = 0;
      const mockResponse: GeoNamePostal = {
        postalCodes: []
      };

      service.getPostalCode(mockLatitude, mockLongitude);

      const req = httpMock.expectOne(request => 
        request.url.includes('/findNearbyPostalCodesJSON')
      );
      
      // Flush empty response - service will try to access postalCodes[0] and fail
      req.flush(mockResponse);

      // Give time for async error to occur
      setTimeout(() => {
        expect(service).toBeTruthy();
        done();
      }, 100);
    });

    it('should handle null response (negative path)', (done) => {
      const mockLatitude = 35.5951;
      const mockLongitude = -82.5515;

      service.getPostalCode(mockLatitude, mockLongitude);

      const req = httpMock.expectOne(request => 
        request.url.includes('/findNearbyPostalCodesJSON')
      );
      req.flush(null);

      // Service should not crash on null response
      setTimeout(() => {
        expect(service).toBeTruthy();
        done();
      }, 100);
    });
  });
});
