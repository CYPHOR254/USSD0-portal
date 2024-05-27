import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAdapterRuleComponent } from './add-edit-adapter-rule.component';

describe('AddEditAdapterRuleComponent', () => {
  let component: AddEditAdapterRuleComponent;
  let fixture: ComponentFixture<AddEditAdapterRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAdapterRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAdapterRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
