import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UssdMetadataComponent } from './ussd-metadata.component';

describe('UssdMetadataComponent', () => {
  let component: UssdMetadataComponent;
  let fixture: ComponentFixture<UssdMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UssdMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UssdMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
