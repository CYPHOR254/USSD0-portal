import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdPromptsComponent } from './ussd-prompts.component';

describe('UssdPromptsComponent', () => {
  let component: UssdPromptsComponent;
  let fixture: ComponentFixture<UssdPromptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdPromptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdPromptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
