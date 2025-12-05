// src/app/features/planning/data/planning.store.ts
import { Injectable, signal, computed } from '@angular/core';
import { Sprint } from '../models/sprint.model';
import { Task } from '../models/task.model';
import { Team } from '../../teams/models/team.model';
import { calculateMemberLoad, MemberLoad } from '../models/load.model';

@Injectable({ providedIn: 'root' })
export class PlanningStore {
  private readonly _currentSprint = signal<Sprint | null>(null);
  private readonly _teams = signal<Team[]>([]);

  readonly currentSprint = this._currentSprint.asReadonly();

  readonly memberLoad = computed<MemberLoad[]>(() => {
    const sprint = this._currentSprint();
    const teams = this._teams();
    if (!sprint) return [];
    return calculateMemberLoad(sprint, teams);
  });

  setCurrentSprint(sprint: Sprint | null): void {
    this._currentSprint.set(sprint);
  }

  setTeams(teams: Team[]): void {
    this._teams.set(teams);
  }

  addTask(task: Task): void {
    const sprint = this._currentSprint();
    if (!sprint) return;

    const updated: Sprint = {
      ...sprint,
      tasks: [...sprint.tasks, task],
    };
    this._currentSprint.set(updated);
  }

  updateTask(task: Task): void {
    const sprint = this._currentSprint();
    if (!sprint) return;

    const updatedTasks = sprint.tasks.map((t) => (t.id === task.id ? task : t));

    this._currentSprint.set({
      ...sprint,
      tasks: updatedTasks,
    });
  }
}
