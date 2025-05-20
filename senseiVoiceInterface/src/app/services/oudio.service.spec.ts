import { TestBed } from '@angular/core/testing';

import { OudioService } from './oudio.service';

describe('OudioService', () => {
  let service: OudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
