import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationComponent } from './generation.component';

describe('GenerationComponent', () => {
  let component: GenerationComponent;
  let fixture: ComponentFixture<GenerationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerationComponent]
    });
    fixture = TestBed.createComponent(GenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
