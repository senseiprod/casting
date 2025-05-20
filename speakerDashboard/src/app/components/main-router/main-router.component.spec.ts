import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainRouterComponent } from './main-router.component';

describe('MainRouterComponent', () => {
  let component: MainRouterComponent;
  let fixture: ComponentFixture<MainRouterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainRouterComponent]
    });
    fixture = TestBed.createComponent(MainRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
