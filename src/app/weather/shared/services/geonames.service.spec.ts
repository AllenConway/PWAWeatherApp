import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GeonamesService } from './geonames.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GeonamesService', () => {
  let service: GeonamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(GeonamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
