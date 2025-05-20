import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationWithLanguageComponent } from './generation-with-language.component';

describe('GenerationWithLanguageComponent', () => {
  let component: GenerationWithLanguageComponent;
  let fixture: ComponentFixture<GenerationWithLanguageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerationWithLanguageComponent]
    });
    fixture = TestBed.createComponent(GenerationWithLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
