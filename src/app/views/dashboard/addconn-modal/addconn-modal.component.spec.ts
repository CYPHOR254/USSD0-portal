import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddconnModalComponent } from './addconn-modal.component';

describe('AddconnModalComponent', () => {
  let component: AddconnModalComponent;
  let fixture: ComponentFixture<AddconnModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddconnModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddconnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
