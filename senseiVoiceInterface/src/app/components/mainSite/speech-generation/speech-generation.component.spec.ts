import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechGenerationComponent } from './speech-generation.component';

describe('SpeechGenerationComponent', () => {
  let component: SpeechGenerationComponent;
  let fixture: ComponentFixture<SpeechGenerationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpeechGenerationComponent]
    });
    fixture = TestBed.createComponent(SpeechGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
