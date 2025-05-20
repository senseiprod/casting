import { TestBed } from '@angular/core/testing';

import { FavoriteVoicesService } from './favorite-voices.service';

describe('FavoriteVoicesService', () => {
  let service: FavoriteVoicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteVoicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
