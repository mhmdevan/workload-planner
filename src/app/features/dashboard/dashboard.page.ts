// src/app/features/dashboard/dashboard.page.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

import { toSignal } from '@angular/core/rxjs-interop';

import { TeamsStore } from '../teams/data/teams.store';
import { Team } from '../teams/models/team.model';
import {
  calculateDashboardMetrics,
  DashboardMetrics,
  RoleDistributionEntry,
} from './dashboard.metrics';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  private readonly teamsStore = inject(TeamsStore);

  // RxJS → Signal
  readonly teams = toSignal(this.teamsStore.teams$, {
    initialValue: [] as Team[],
  });

  readonly metrics = computed<DashboardMetrics>(() => calculateDashboardMetrics(this.teams()));

  readonly rolesChartType = 'doughnut' as const;

  readonly rolesChartOptions: ChartOptions<'doughnut'> = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
        },
      },
    },
    maintainAspectRatio: false,
  };

  readonly rolesChartData = computed<ChartData<'doughnut', number[], string>>(() => {
    const { rolesDistribution } = this.metrics();

    const labels = rolesDistribution.map((r: RoleDistributionEntry) => r.role);
    const data = rolesDistribution.map((r: RoleDistributionEntry) => r.count);

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  });
}
