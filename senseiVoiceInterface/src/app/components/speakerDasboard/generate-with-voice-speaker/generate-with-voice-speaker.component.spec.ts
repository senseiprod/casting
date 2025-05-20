import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateWithVoiceSpeakerComponent } from './generate-with-voice-speaker.component';

describe('GenerateWithVoiceSpeakerComponent', () => {
  let component: GenerateWithVoiceSpeakerComponent;
  let fixture: ComponentFixture<GenerateWithVoiceSpeakerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateWithVoiceSpeakerComponent]
    });
    fixture = TestBed.createComponent(GenerateWithVoiceSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
