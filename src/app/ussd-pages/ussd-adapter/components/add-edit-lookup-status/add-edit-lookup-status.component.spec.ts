import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLookupStatusComponent } from './add-edit-lookup-status.component';

describe('AddEditLookupStatusComponent', () => {
  let component: AddEditLookupStatusComponent;
  let fixture: ComponentFixture<AddEditLookupStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditLookupStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditLookupStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
