import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationRequestComponent } from './generation-request.component';

describe('GenerationRequestComponent', () => {
  let component: GenerationRequestComponent;
  let fixture: ComponentFixture<GenerationRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerationRequestComponent]
    });
    fixture = TestBed.createComponent(GenerationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
