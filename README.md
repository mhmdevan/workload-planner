# Workload Planner – Angular Enterprise Demo

A production-style **workload planning dashboard** for engineering teams, built to demonstrate **senior-level Angular skills**:

- Clean architecture with **standalone components**, **Signals** and **RxJS**  
- **PWA-ready** with Angular Service Worker & offline caching  
- Strong focus on **clean code** principles (SOLID, DRY, KISS, YAGNI)  
- Unit tests for stores and pure functions  
- Structured and documented so it can be **defended in an interview**

> This repo is intentionally structured like a real-world product, not a toy demo.  
> The goal is that you can walk through it in an interview and clearly explain your decisions, trade-offs, and metrics.

---

## 1. Problem & Motivation

### 1.1 The problem

In most teams, planning work across people and sprints becomes painful quickly:

- PMs don’t see **who is overloaded** and who has spare capacity.
- Leads don’t have a quick view of **role distribution** (dev/QA/design/management).
- Planning meetings get stuck in **spreadsheets** and **ad-hoc discussions**.
- Every squad ends up building its **own spreadsheet**, with no shared language.

### 1.2 The solution

**Workload Planner** is a small but realistic internal tool:

- Model teams, members, roles and their weekly capacity.
- See **analytics** for:
  - total teams / active teams
  - total members
  - average capacity consumption per member
  - role distribution (developer / QA / designer / manager)
- Explore team details in a **filterable table**.
- Plan work and assign tasks (planning feature stubbed, designed for extension).
- Works **offline** (PWA) and is built with patterns that can later scale to microfrontends.

This project is not just a UI – it’s an example of how I structure an Angular codebase to keep it maintainable over time.

---

## 2. High-Level Architecture

This repository currently contains a single Angular application in `src/`.  
The structure is intentionally **feature-oriented**:

```text
workload-planner/
├─ src/
│  ├─ app/
│  │  ├─ core/
│  │  │  ├─ layout/               # main layout, toolbar, sidenav, theme toggle
│  │  │  ├─ interceptors/         # auth + API error interceptors
│  │  │  ├─ services/             # API_CONFIG token, theming helpers
│  │  │  └─ core.types.ts         # small shared types if needed
│  │  ├─ features/
│  │  │  ├─ dashboard/            # workload metrics + charts
│  │  │  ├─ teams/                # teams list, store, models, UI
│  │  │  └─ planning/             # planning page (tasks & assignments)
│  │  ├─ app.routes.ts            # route definitions
│  │  ├─ app.config.ts            # ApplicationConfig: providers, PWA, HTTP, etc.
│  │  └─ app.component.ts         # root shell
│  ├─ assets/
│  │  └─ i18n/                     # (optional) translations for future extension
│  ├─ styles/
│  │  ├─ _variables.scss           # colors, typography scale, breakpoints
│  │  ├─ _mixins.scss              # layout helpers, media queries
│  │  └─ styles.scss               # global styles entry
│  ├─ main.ts                      # bootstrap for the browser app
│  └─ main.server.ts (if present)  # SSR entry (not required for PWA)
│
├─ angular.json
├─ package.json
├─ pnpm-lock.yaml
└─ README.md                       # this file
```

Right now the focus is on:

- A **clean, maintainable SPA** with:
  - Angular 21 standalone APIs
  - Signals + RxJS stores
  - Material Design components
- A **PWA layer** to show awareness of offline-first design.
- Testable business logic & data access.

A possible future step would be to add a real **microfrontend / Module Federation** setup under an `apps/` directory, but that is intentionally **not yet present** in this version to keep complexity under control.

---

## 3. Tech Stack & Design Decisions

### 3.1 Core technologies

- **Angular 21** (standalone APIs, `ApplicationConfig`)
- **TypeScript**
- **RxJS** for reactive state and streams
- **Angular Material** for layout and UI controls
- **SCSS** with shared variables & mixins
- **ng2-charts v8+** with `provideCharts(withDefaultRegisterables())`
- **@angular/service-worker** for PWA
- **Angular test runner + Jasmine** for unit tests
- **pnpm** as package manager

### 3.2 Key libraries & why they were chosen

- `@angular/material`  
  Fast path to a consistent, accessible design system without reinventing basic UI primitives (layouts, forms, tables).

- `@angular/service-worker`  
  Idiomatic Angular way to enable PWA features: precaching, runtime caching, offline app shell – no need to hand-roll service workers.

- `ng2-charts`  
  Thin Angular wrapper around Chart.js; integrates nicely with standalone components and signals to visualize metrics.

- Built-in **Angular testing**  
  Kept close to the Angular ecosystem to avoid unnecessary tooling noise and to keep the focus on **business logic**.

---

## 4. Features

### 4.1 Dashboard

**Folder:** `src/app/features/dashboard/`

The dashboard aggregates workload metrics from the teams domain:

- `totalTeams`
- `activeTeams` (teams with at least one member)
- `totalMembers`
- `averageCapacityPerMember`
- `rolesDistribution` (developer / QA / design / manager)

Core of the logic is a **pure function**:

```ts
export interface DashboardMetrics {
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  averageCapacityPerMember: number;
  rolesDistribution: { role: MemberRole; count: number }[];
}

export function calculateDashboardMetrics(teams: Team[]): DashboardMetrics {
  // pure function: no side effects, easy to test
}
```

This function is unit-tested in isolation.  
The component uses Angular **signals** to:

- consume metrics,
- drive the view (cards + chart),
- lazily compute a `ChartData<'doughnut'>` object for `ng2-charts`.

The rationale:

- Business logic is **not** buried in templates.
- The same metrics function can be reused in another view or even another app.

---

### 4.2 Teams module

**Folder:** `src/app/features/teams/`

#### 4.2.1 Models

```ts
export type MemberRole = 'developer' | 'qa' | 'manager' | 'designer';

export interface Member {
  id: string;
  fullName: string;
  role: MemberRole;
  skills: string[];
  weeklyCapacityHours: number;
  active: boolean;
  currentLoad?: number; // 0..1, optional
}

export interface Team {
  id: string;
  name: string;
  code: string;
  members: Member[];
  isActive: boolean;
}
```

#### 4.2.2 Store (`TeamsStore`)

The store encapsulates all state and HTTP logic:

```ts
@Injectable({ providedIn: 'root' })
export class TeamsStore {
  private readonly http = inject(HttpClient);
  private readonly api = inject<ApiConfig>(API_CONFIG);

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
      if (!allMembers.length) return 0;
      const total = allMembers.reduce(
        (sum, m) => sum + (m.currentLoad ?? 0),
        0
      );
      return total / allMembers.length;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Angular signals for easy consumption in components
  readonly teams = toSignal(this.teams$, { initialValue: [] as Team[] });
  readonly loading = toSignal(this.loading$, { initialValue: false });
  readonly error = toSignal(this.error$, { initialValue: null });

  // switch between real API and mock data based on API_CONFIG
  private readonly useMock = this.api.baseUrl === 'MOCK';

  private readonly MOCK_TEAMS: Team[] = [
    // realistic example data for demos / offline usage
  ];

  constructor() {
    if (this.useMock) {
      this._teams$.next(this.MOCK_TEAMS);
    } else {
      this.loadTeams().subscribe();
    }
  }

  loadTeams(): Observable<Team[]> {
    if (this.useMock) {
      this._teams$.next(this.MOCK_TEAMS);
      return of(this.MOCK_TEAMS);
    }

    this._loading$.next(true);
    this._error$.next(null);

    return this.http.get<Team[]>(`${this.api.baseUrl}/teams`).pipe(
      tap((teams) => this._teams$.next(teams)),
      catchError((err) => {
        console.error('[TeamsStore] Failed to load teams', err);
        // fallback to mock instead of breaking the UI
        this._teams$.next(this.MOCK_TEAMS);
        this._error$.next('Failed to load teams, using mock data instead');
        return of(this.MOCK_TEAMS);
      }),
      finalize(() => this._loading$.next(false))
    );
  }
}
```

Key points to explain in an interview:

- **Dependency Inversion**: API URL is driven by `API_CONFIG` injection token → store is decoupled from environment.
- **Resilience**: even if the backend is down, the UI falls back to `MOCK_TEAMS` so the demo remains usable.
- **Testability**: all HTTP calls go through `HttpClient`, so `HttpClientTestingModule` can control them.

#### 4.2.3 UI (`TeamsPage`)

The `TeamsPage` component demonstrates:

- Signals for state consumption:

  ```ts
  readonly teams = toSignal(this.store.teams$, { initialValue: [] as Team[] });
  readonly loading = toSignal(this.store.loading$, { initialValue: false });
  readonly error = toSignal(this.store.error$, { initialValue: null });
  ```

- A reactive filter form:

  ```ts
  filterForm = new FormGroup({
    search: new FormControl<string>('', { nonNullable: true }),
    activeOnly: new FormControl<boolean>(true, { nonNullable: true }),
  });
  ```

- A derived `filteredTeams` signal:

  ```ts
  readonly filteredTeams = computed<Team[]>(() => {
    const search = (this.filterForm.controls.search.value || '').toLowerCase();
    const activeOnly = this.filterForm.controls.activeOnly.value;

    return this.teams().filter((team: Team) => {
      if (activeOnly && !team.isActive) {
        return false;
      }
      if (!search) {
        return true;
      }
      return (
        team.name.toLowerCase().includes(search) ||
        team.code.toLowerCase().includes(search)
      );
    });
  });
  ```

- `mat-table` with explicit column definitions:

  ```ts
  readonly displayedColumns = ['name', 'code', 'members', 'status'];
  ```

This gives a concrete, inspectable example of **Reactive Programming with RxJS + signals** in a real UI.

---

### 4.3 Planning module

**Folder:** `src/app/features/planning/`

The planning module is intentionally kept light:

- Demonstrates a **form-based** planning flow (tasks & assignees).
- Uses `computed` signals to generate options for assignees based on teams.
- Uses strongly-typed models for tasks (assignee, estimated effort, status).
- Designed for future extension into a full drag-and-drop planner or calendar view.

---

### 4.4 PWA / Service Worker

- `@angular/service-worker` integrated via:

  ```ts
  provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),
    registrationStrategy: 'registerWhenStable:30000',
  });
  ```

- `ngsw-config.json` includes:

  - `assetGroups` for app shell & static assets.
  - (Optionally) `dataGroups` for API caching if you decide to cache `teams` responses.

How it is used in practice:

1. Build production bundle:

   ```bash
   pnpm ng build --configuration production
   ```

2. Serve `dist/workload-planner/browser` via a static server (e.g. `http-server`):

   ```bash
   pnpm dlx http-server ./dist/workload-planner/browser -p 4200 -c-1
   ```

3. Open `http://localhost:4200` and validate in DevTools:

   - Service Worker is installed and activated.
   - Application works offline (at least the app shell and mock data).

This is enough to talk about **offline-first** thinking and basic caching strategy in an interview.

---

## 5. Clean Code & Principles

### 5.1 SOLID

- **Single Responsibility Principle (SRP)**
  - `TeamsStore` manages teams data and derived stats – nothing else.
  - `DashboardMetrics` functions are pure and purely computational.
  - Layout components handle only navigation, theming and basic framing.

- **Open/Closed Principle (OCP)**
  - New metrics can be added to `DashboardMetrics` without editing API calls or UI plumbing.
  - New features can be introduced as separate feature folders under `features/`.

- **Dependency Inversion (DIP)**
  - `API_CONFIG` decouples data layer from configuration.
  - Components depend on **abstractions** (store, tokens) rather than concrete URLs.

Other SOLID principles (LSP, ISP) are implicitly respected via clear interfaces and focused services.

### 5.2 DRY

- Shared types for `Team`, `Member`, and `DashboardMetrics` live in a single place.
- Metrics logic lives in dedicated pure functions.
- Layout styles (spacing, breakpoints, colors) are centralized in SCSS variables and mixins.

### 5.3 KISS

- No additional global state library; **RxJS + small stores + signals** are more than enough.
- HTTP logic is contained and minimal.
- The app does a few things well instead of pretending to be a full-fledged Jira clone.

### 5.4 YAGNI

- No unnecessary abstractions or generic frameworks.
- No over-engineered plugin systems.
- Microfrontends / Module Federation are intentionally left as a **future extension**, not prematurely implemented in this repo.

---

## 6. Testing Strategy

### 6.1 Tools

- Angular test runner (v4) with Jasmine.
- `HttpClientTestingModule` and `HttpTestingController` for HTTP mocking.

### 6.2 Implemented tests

1. **App wiring (`app.spec.ts`)**

   - Verifies that the root component bootstraps correctly.

2. **Teams store tests (`teams.store.spec.ts`)**

   - Uses `HttpClientTestingModule` to:
     - control HTTP responses,
     - verify that `GET /teams` is called,
     - assert that the store exposes the loaded teams,
     - assert that loading and error flags behave as expected.

3. **Dashboard metrics tests (`dashboard.metrics.spec.ts`)**

   - Unit-tests `calculateDashboardMetrics` across multiple scenarios:
     - No teams (empty input) → zero metrics.
     - Multiple teams with members and loads → correct aggregation and averaging.
     - Mixed roles → correct role distribution counts.

### 6.3 Possible next steps for tests

- Component tests for `TeamsPage` and `DashboardPage`.
- Snapshot-like tests for computed signals.
- E2E tests (Playwright or Cypress) for critical flows such as filter + navigation.

---

## 7. Metrics & How I Think About Them

Even for a demo project, metrics matter.

### 7.1 Code quality

- Linting (Angular ESLint, if enabled).
- Unit test coverage, especially around:
  - data stores,
  - pure business logic (metrics calculations).

### 7.2 Runtime / performance

- Bundle sizes (as reported by Angular build).
- App shell load time (can be checked via Lighthouse).
- Number of network calls on initial page load.

### 7.3 Developer experience

- How easy it is to:
  - add a new metric,
  - add a new team field (e.g., `department`),
  - change the API base URL.

The current setup is intentionally simple so that **extending the project** is straightforward and safe.

---

## 8. Running the Project

### 8.1 Prerequisites

- Node.js (LTS is recommended).
- `pnpm` installed globally:

  ```bash
  npm install -g pnpm
  ```

### 8.2 Install dependencies

```bash
pnpm install
```

### 8.3 Run the app (development)

```bash
pnpm start
# => http://localhost:4200
```

### 8.4 Run unit tests

```bash
pnpm test
```

### 8.5 Production build + PWA check

```bash
pnpm ng build --configuration production
pnpm dlx http-server ./dist/workload-planner/browser -p 4200 -c-1
# open http://localhost:4200 in the browser
```

Then:

- Open DevTools → Application → Service Workers.
- Confirm the service worker is installed.
- Toggle offline mode and verify the shell still loads.

---

## 9. Future Work / Roadmap

These are ideas that **can be built on top of this repo** to demonstrate even more senior skills, but are intentionally not implemented yet to keep the scope clear:

- **Module Federation / Microfrontends**
  - Introduce an `apps/shell` (host) and `apps/analytics` (remote).
  - Expose the existing dashboard as a federated remote.
  - Show how multiple Angular apps can share code and be deployed independently.

- **Real backend integration**
  - Replace `MOCK_TEAMS` with a real backend service.
  - Secure APIs with auth tokens via the existing `authInterceptor`.

- **More advanced PWA features**
  - Fine-tuned `dataGroups` for API caching.
  - Background sync for offline changes.

- **E2E tests**
  - Use Playwright/Cypress for critical flows.

These items form a natural “next stage” conversation in interviews: *What would you do next if the product grows?*

---

## 10. What This Repo Demonstrates About My Skills

This repository is designed to demonstrate that I can:

- Design and implement a **clean Angular architecture** with:
  - standalone components,
  - signals & RxJS stores,
  - feature-based structure.
- Work comfortably with **TypeScript** and strong typing.
- Apply **Reactive Programming** in a pragmatic way (RxJS + signals).
- Enable **PWA** features and reason about offline behavior.
- Write **unit tests** for stores and pure logic.
- Apply clean code principles (SOLID, DRY, KISS, YAGNI) in a real codebase.
- Explain decisions, trade-offs, and potential next steps clearly in an interview.

If you’re reading this as an interviewer and want to dive deeper, the fastest files to look at are:

- `src/app/features/teams/data/teams.store.ts`
- `src/app/features/dashboard/dashboard.metrics.ts`
- `src/app/features/dashboard/dashboard.page.ts`
- `ngsw-config.json`
- `src/app/app.config.ts`

Together, they tell most of the architectural story of this project.

---

## 11. License

```text
MIT License

Copyright (c) 2025 Mohammad Eslamnia
```
