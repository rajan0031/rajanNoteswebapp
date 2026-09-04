import { TestBed } from '@angular/core/testing';

import { Connectdb } from './connectdb';

describe('Connectdb', () => {
  let service: Connectdb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Connectdb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
