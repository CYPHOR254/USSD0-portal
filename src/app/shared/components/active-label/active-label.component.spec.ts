import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveLabelComponent } from './active-label.component';

describe('ActiveLabelComponent', () => {
  let component: ActiveLabelComponent;
  let fixture: ComponentFixture<ActiveLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveLabelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
