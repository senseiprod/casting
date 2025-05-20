import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWithSlectedLanguageComponent } from './list-with-slected-language.component';

describe('ListWithSlectedLanguageComponent', () => {
  let component: ListWithSlectedLanguageComponent;
  let fixture: ComponentFixture<ListWithSlectedLanguageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListWithSlectedLanguageComponent]
    });
    fixture = TestBed.createComponent(ListWithSlectedLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
