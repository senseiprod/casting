import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationWithSpeakerComponent } from './generation-with-speaker.component';

describe('GenerationWithSpeakerComponent', () => {
  let component: GenerationWithSpeakerComponent;
  let fixture: ComponentFixture<GenerationWithSpeakerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerationWithSpeakerComponent]
    });
    fixture = TestBed.createComponent(GenerationWithSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
