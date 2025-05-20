import { TestBed } from '@angular/core/testing';

import { ElevenLabsService } from './eleven-labs.service';

describe('ElevenLabsService', () => {
  let service: ElevenLabsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElevenLabsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
