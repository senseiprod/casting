import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanckComponent } from './banck.component';

describe('BanckComponent', () => {
  let component: BanckComponent;
  let fixture: ComponentFixture<BanckComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BanckComponent]
    });
    fixture = TestBed.createComponent(BanckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
