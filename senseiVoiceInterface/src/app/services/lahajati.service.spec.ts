import { TestBed } from '@angular/core/testing';

import { LahajatiService } from './lahajati.service';

describe('LahajatiService', () => {
  let service: LahajatiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LahajatiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
