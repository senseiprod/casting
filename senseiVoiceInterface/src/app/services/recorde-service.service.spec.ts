import { TestBed } from '@angular/core/testing';

import { RecordeServiceService } from './recorde-service.service';

describe('RecordeServiceService', () => {
  let service: RecordeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
