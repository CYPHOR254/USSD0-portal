import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdEndpointsComponent } from './ussd-endpoints.component';

describe('UssdEndpointsComponent', () => {
  let component: UssdEndpointsComponent;
  let fixture: ComponentFixture<UssdEndpointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdEndpointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdEndpointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
