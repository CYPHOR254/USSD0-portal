import { TestBed } from '@angular/core/testing';

import { HandleUssdJsonService } from './handle-ussd-json.service';

describe('HandleUssdJsonService', () => {
  let service: HandleUssdJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleUssdJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
