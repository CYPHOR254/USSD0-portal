import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRedisDbMngtComponent } from './add-edit-redis-db-mngt.component';

describe('AddEditRedisDbMngtComponent', () => {
  let component: AddEditRedisDbMngtComponent;
  let fixture: ComponentFixture<AddEditRedisDbMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditRedisDbMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditRedisDbMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
