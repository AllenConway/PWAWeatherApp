import { TestBed } from '@angular/core/testing';

import { GeonamesService } from './geonames.service';

describe('GeonamesService', () => {
  let service: GeonamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeonamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
