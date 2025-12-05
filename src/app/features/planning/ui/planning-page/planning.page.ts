// src/app/features/planning/ui/planning-page/planning.page.ts
import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Team } from '../../../teams/models/team.model';

import { PlanningStore } from '../../data/planning.store';
import { TeamsStore } from '../../../teams/data/teams.store';
import { Task } from '../../models/task.model';
import { MemberLoad } from '../../models/load.model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-planning-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './planning.page.html',
  styleUrls: ['./planning.page.scss'],
})
export class PlanningPage implements OnInit {
  private readonly planningStore = inject(PlanningStore);
  private readonly teamsStore = inject(TeamsStore);

  readonly teams = toSignal(this.teamsStore.teams$, {
    initialValue: [] as Team[],
  });

  readonly memberOptions = computed(() => this.teams().flatMap((t: Team) => t.members));

  readonly currentSprint = this.planningStore.currentSprint;
  readonly memberLoad = this.planningStore.memberLoad;

  readonly taskForm = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    estimateHours: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    assigneeId: new FormControl<string | null>(null),
  });

  readonly loadColumns = ['member', 'planned', 'capacity', 'utilization'];

  ngOnInit(): void {
    this.planningStore.setTeams(this.teams());
    const mockSprintStart = new Date();
    const mockSprintEnd = new Date();
    mockSprintEnd.setDate(mockSprintStart.getDate() + 14);

    this.planningStore.setCurrentSprint({
      id: 'sprint-1',
      name: 'Sprint 1',
      startDate: mockSprintStart.toISOString(),
      endDate: mockSprintEnd.toISOString(),
      tasks: [],
    });
  }

  submitTask(): void {
    if (this.taskForm.invalid || !this.currentSprint()) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const value = this.taskForm.getRawValue();

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: value.title ?? '', // چون required هست، این فقط برای راضی کردن TS
      estimateHours: value.estimateHours ?? 0,
      assigneeId: value.assigneeId ?? null,
      status: 'planned',
    };

    this.planningStore.addTask(newTask);
    this.taskForm.reset({
      title: '',
      estimateHours: null,
      assigneeId: null,
    });
  }

  utilizationClass(load: MemberLoad): string {
    if (load.utilization === 0) {
      return 'utilization--idle';
    }
    if (load.utilization <= 1) {
      return 'utilization--ok';
    }
    if (load.utilization <= 1.2) {
      return 'utilization--warning';
    }
    return 'utilization--overloaded';
  }
}
