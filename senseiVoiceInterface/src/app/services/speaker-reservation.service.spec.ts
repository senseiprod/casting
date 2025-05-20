import { TestBed } from '@angular/core/testing';

import { SpeakerReservationService } from './speaker-reservation.service';

describe('SpeakerReservationService', () => {
  let service: SpeakerReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeakerReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
