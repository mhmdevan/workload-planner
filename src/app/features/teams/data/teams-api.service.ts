// src/app/features/teams/data/teams-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG, ApiConfig } from '../../../core/services/api-config.token';
import { Team } from '../models/team.model';
import { Observable, of, delay } from 'rxjs';
import { INITIAL_TEAMS } from './teams.mock';

@Injectable({ providedIn: 'root' })
export class TeamsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<ApiConfig>(API_CONFIG);

  getTeams(): Observable<Team[]> {
    return of(INITIAL_TEAMS).pipe(delay(300));
  }
}
