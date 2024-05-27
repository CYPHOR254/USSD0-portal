import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRedisDbMngtComponent } from './list-redis-db-mngt.component';

describe('ListRedisDbMngtComponent', () => {
  let component: ListRedisDbMngtComponent;
  let fixture: ComponentFixture<ListRedisDbMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListRedisDbMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRedisDbMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
