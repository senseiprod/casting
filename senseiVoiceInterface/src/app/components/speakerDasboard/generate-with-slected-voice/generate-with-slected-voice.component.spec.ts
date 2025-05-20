import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateWithSlectedVoiceComponent } from './generate-with-slected-voice.component';

describe('GenerateWithSlectedVoiceComponent', () => {
  let component: GenerateWithSlectedVoiceComponent;
  let fixture: ComponentFixture<GenerateWithSlectedVoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateWithSlectedVoiceComponent]
    });
    fixture = TestBed.createComponent(GenerateWithSlectedVoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
