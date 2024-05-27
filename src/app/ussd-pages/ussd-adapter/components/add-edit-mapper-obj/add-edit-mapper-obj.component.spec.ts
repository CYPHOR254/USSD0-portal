import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditMapperObjComponent } from './add-edit-mapper-obj.component';

describe('AddEditMapperObjComponent', () => {
  let component: AddEditMapperObjComponent;
  let fixture: ComponentFixture<AddEditMapperObjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditMapperObjComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditMapperObjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
