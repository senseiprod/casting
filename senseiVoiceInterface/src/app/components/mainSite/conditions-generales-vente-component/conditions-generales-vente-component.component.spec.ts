import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsGeneralesVenteComponentComponent } from './conditions-generales-vente-component.component';

describe('ConditionsGeneralesVenteComponentComponent', () => {
  let component: ConditionsGeneralesVenteComponentComponent;
  let fixture: ComponentFixture<ConditionsGeneralesVenteComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConditionsGeneralesVenteComponentComponent]
    });
    fixture = TestBed.createComponent(ConditionsGeneralesVenteComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
