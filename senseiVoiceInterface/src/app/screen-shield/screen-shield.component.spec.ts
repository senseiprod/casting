import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenShieldComponent } from './screen-shield.component';

describe('ScreenShieldComponent', () => {
  let component: ScreenShieldComponent;
  let fixture: ComponentFixture<ScreenShieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScreenShieldComponent]
    });
    fixture = TestBed.createComponent(ScreenShieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
