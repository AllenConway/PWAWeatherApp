import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GeonamesService } from './geonames.service';

describe('GeonamesService', () => {
  let service: GeonamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })],
    });
    service = TestBed.inject(GeonamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
