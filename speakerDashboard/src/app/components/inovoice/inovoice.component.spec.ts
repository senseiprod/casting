import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InovoiceComponent } from './inovoice.component';

describe('InovoiceComponent', () => {
  let component: InovoiceComponent;
  let fixture: ComponentFixture<InovoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InovoiceComponent]
    });
    fixture = TestBed.createComponent(InovoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
