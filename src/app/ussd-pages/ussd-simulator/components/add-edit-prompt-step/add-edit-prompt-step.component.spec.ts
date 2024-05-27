import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPromptStepComponent } from './add-edit-prompt-step.component';

describe('AddEditPromptStepComponent', () => {
  let component: AddEditPromptStepComponent;
  let fixture: ComponentFixture<AddEditPromptStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditPromptStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditPromptStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
