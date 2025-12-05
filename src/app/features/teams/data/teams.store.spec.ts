// src/app/features/teams/data/teams.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TeamsStore } from './teams.store';
import { API_CONFIG } from '../../../core/services/api-config.token';
import { Team } from '../models/team.model';

describe('TeamsStore', () => {
  let store: TeamsStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TeamsStore,
        {
          provide: API_CONFIG,
          useValue: { baseUrl: 'https://api.example.com' },
        },
      ],
    });

    store = TestBed.inject(TeamsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load teams and expose them via observable', () => {
    const mockTeams: Team[] = [
      {
        id: 't1',
        name: 'Core',
        code: 'CORE',
        isActive: true,
        members: [],
      },
    ];

    let latest: Team[] | null = null;

    store.teams$.subscribe((teams) => {
      latest = teams;
    });

    const req = httpMock.expectOne('https://api.example.com/teams');
    expect(req.request.method).toBe('GET');

    req.flush(mockTeams);

    expect(latest).toEqual(mockTeams);
  });
});
