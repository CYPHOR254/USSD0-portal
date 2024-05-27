import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdTestingComponent } from './ussd-testing.component';

describe('UssdTestingComponent', () => {
  let component: UssdTestingComponent;
  let fixture: ComponentFixture<UssdTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdTestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
