import { TestBed } from '@angular/core/testing';

import { SpeakerServiceService } from './speaker-service.service';

describe('SpeakerServiceService', () => {
  let service: SpeakerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeakerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
