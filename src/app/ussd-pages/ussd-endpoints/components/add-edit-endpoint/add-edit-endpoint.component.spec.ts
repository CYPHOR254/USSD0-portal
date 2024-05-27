import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEndpointComponent } from './add-edit-endpoint.component';

describe('AddEditEndpointComponent', () => {
  let component: AddEditEndpointComponent;
  let fixture: ComponentFixture<AddEditEndpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditEndpointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
