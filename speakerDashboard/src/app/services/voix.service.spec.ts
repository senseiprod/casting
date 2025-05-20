import { TestBed } from '@angular/core/testing';

import { VoixService } from './voix.service';

describe('VoixService', () => {
  let service: VoixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
