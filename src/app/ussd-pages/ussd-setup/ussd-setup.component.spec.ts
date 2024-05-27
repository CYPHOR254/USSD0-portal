import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdSetupComponent } from './ussd-setup.component';

describe('UssdSetupComponent', () => {
  let component: UssdSetupComponent;
  let fixture: ComponentFixture<UssdSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
