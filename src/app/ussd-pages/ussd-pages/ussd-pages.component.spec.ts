import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdPagesComponent } from './ussd-pages.component';

describe('UssdPagesComponent', () => {
  let component: UssdPagesComponent;
  let fixture: ComponentFixture<UssdPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdPagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
