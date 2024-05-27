import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdAdapterComponent } from './ussd-adapter.component';

describe('UssdAdapterComponent', () => {
  let component: UssdAdapterComponent;
  let fixture: ComponentFixture<UssdAdapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdAdapterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdAdapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
