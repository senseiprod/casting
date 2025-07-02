import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessBalanceChargeComponent } from './success-balance-charge.component';

describe('SuccessBalanceChargeComponent', () => {
  let component: SuccessBalanceChargeComponent;
  let fixture: ComponentFixture<SuccessBalanceChargeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuccessBalanceChargeComponent]
    });
    fixture = TestBed.createComponent(SuccessBalanceChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
