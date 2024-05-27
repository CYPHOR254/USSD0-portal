import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditHostedUrlComponent } from './add-edit-hosted-url.component';

describe('AddEditHostedUrlComponent', () => {
  let component: AddEditHostedUrlComponent;
  let fixture: ComponentFixture<AddEditHostedUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditHostedUrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditHostedUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
