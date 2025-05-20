import { TestBed } from '@angular/core/testing';

import { DemandeServiceService } from './demande-service.service';

describe('DemandeServiceService', () => {
  let service: DemandeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
