import { TestBed } from '@angular/core/testing';

import { VoiceElenlabsService } from './voice-elenlabs.service';

describe('VoiceElenlabsService', () => {
  let service: VoiceElenlabsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceElenlabsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
