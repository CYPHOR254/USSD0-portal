import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPromptComponent } from './test-prompt.component';

describe('TestPromptComponent', () => {
  let component: TestPromptComponent;
  let fixture: ComponentFixture<TestPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestPromptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
