import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumainVoiceComponent } from './humain-voice.component';

describe('HumainVoiceComponent', () => {
  let component: HumainVoiceComponent;
  let fixture: ComponentFixture<HumainVoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HumainVoiceComponent]
    });
    fixture = TestBed.createComponent(HumainVoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
