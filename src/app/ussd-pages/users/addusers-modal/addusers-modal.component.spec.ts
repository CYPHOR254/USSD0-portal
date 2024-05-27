import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddusersModalComponent } from './addusers-modal.component';

describe('AddusersModalComponent', () => {
  let component: AddusersModalComponent;
  let fixture: ComponentFixture<AddusersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddusersModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddusersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
