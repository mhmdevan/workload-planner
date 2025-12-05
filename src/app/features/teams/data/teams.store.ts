// src/app/features/teams/data/teams.store.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

import { toSignal } from '@angular/core/rxjs-interop';

import { API_CONFIG, ApiConfig } from '../../../core/services/api-config.token';
import { Team, Member } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamsStore {
  private readonly http = inject(HttpClient);
  private readonly api = inject<ApiConfig>(API_CONFIG);

  // سوییچ برای mock mode
  private readonly useMock = this.api.baseUrl === 'MOCK';

  // دیتاهای mock
  private readonly MOCK_TEAMS: Team[] = [
    {
      id: 'team-1',
      name: 'Core Platform',
      code: 'CORE',
      isActive: true,
      members: [
        {
          id: 'm1',
          fullName: 'Alice Backend',
          role: 'developer',
          skills: ['Node.js', 'PostgreSQL'],
          weeklyCapacityHours: 40,
          active: true,
          currentLoad: 0.8,
        },
        {
          id: 'm2',
          fullName: 'Bob Frontend',
          role: 'developer',
          skills: ['Angular', 'RxJS'],
          weeklyCapacityHours: 35,
          active: true,
          currentLoad: 0.6,
        },
      ],
    },
    {
      id: 'team-2',
      name: 'Quality Assurance',
      code: 'QA',
      isActive: true,
      members: [
        {
          id: 'm3',
          fullName: 'Charlie QA',
          role: 'qa',
          skills: ['Playwright', 'Jest'],
          weeklyCapacityHours: 30,
          active: true,
          currentLoad: 0.5,
        },
      ],
    },
    {
      id: 'team-3',
      name: 'Design Studio',
      code: 'DESIGN',
      isActive: false,
      members: [],
    },
  ];

  private readonly _teams$ = new BehaviorSubject<Team[]>([]);
  readonly teams$ = this._teams$.asObservable();

  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  private readonly _error$ = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error$.asObservable();

  readonly totalMembers$ = this.teams$.pipe(
    map((teams) => teams.reduce((sum, t) => sum + t.members.length, 0)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly averageLoad$ = this.teams$.pipe(
    map((teams) => {
      const allMembers: Member[] = teams.flatMap((t) => t.members);
      if (!allMembers.length) {
        return 0;
      }
      const total = allMembers.reduce((sum, m) => sum + (m.currentLoad ?? 0), 0);
      return total / allMembers.length;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Signals برای مصرف در کامپوننت‌ها
  readonly teams = toSignal(this.teams$, { initialValue: [] as Team[] });
  readonly loading = toSignal(this.loading$, { initialValue: false });
  readonly error = toSignal(this.error$, { initialValue: null });

  constructor() {
    if (this.useMock) {
      // فقط mock data، بدون HTTP
      this._teams$.next(this.MOCK_TEAMS);
      return;
    }

    // حالت واقعی (وقتی baseUrl چیز دیگری‌ست)
    this.loadTeams().subscribe();
  }

  loadTeams(): Observable<Team[]> {
    if (this.useMock) {
      // اگر یکی از کامپوننت‌ها بعداً دوباره load صدا زد، باز هم mock بده
      this._loading$.next(true);
      this._error$.next(null);

      const mock = this.MOCK_TEAMS;
      this._teams$.next(mock);
      this._loading$.next(false);

      return of(mock);
    }

    this._loading$.next(true);
    this._error$.next(null);

    return this.http.get<Team[]>(`${this.api.baseUrl}/teams`).pipe(
      tap((teams) => this._teams$.next(teams)),
      catchError((err) => {
        console.error('[TeamsStore] Failed to load teams', err);

        // fallback: حتی اگر backend ترکید، باز هم UI با mock کار کند
        this._teams$.next(this.MOCK_TEAMS);
        this._error$.next('Failed to load teams, using mock data instead');

        return of(this.MOCK_TEAMS);
      }),
      finalize(() => this._loading$.next(false))
    );
  }
}
