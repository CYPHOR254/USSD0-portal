import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdEnvironmentsComponent } from './ussd-environments.component';

describe('UssdEnvironmentsComponent', () => {
  let component: UssdEnvironmentsComponent;
  let fixture: ComponentFixture<UssdEnvironmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdEnvironmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdEnvironmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
