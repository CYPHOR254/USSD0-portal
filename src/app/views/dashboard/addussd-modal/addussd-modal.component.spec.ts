import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddussdModalComponent } from './addussd-modal.component';

describe('AddussdModalComponent', () => {
  let component: AddussdModalComponent;
  let fixture: ComponentFixture<AddussdModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddussdModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddussdModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
