import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerDashboardComponent } from './speaker-dashboard.component';

describe('SpeakerDashboardComponent', () => {
  let component: SpeakerDashboardComponent;
  let fixture: ComponentFixture<SpeakerDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpeakerDashboardComponent]
    });
    fixture = TestBed.createComponent(SpeakerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
