// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'teams',
        loadChildren: () => import('./features/teams/teams.routes').then((m) => m.TEAMS_ROUTES),
      },
      {
        path: 'planning',
        loadChildren: () =>
          import('./features/planning/planning.routes').then((m) => m.PLANNING_ROUTES),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
