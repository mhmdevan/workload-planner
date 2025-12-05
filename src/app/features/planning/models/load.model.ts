// src/app/features/planning/models/load.model.ts
import { Sprint } from './sprint.model';
import { Team } from '../../teams/models/team.model';

export interface MemberLoad {
  memberId: string;
  fullName: string;
  plannedHours: number;
  capacityHours: number;
  utilization: number; // 0..N
}

export function calculateMemberLoad(sprint: Sprint, teams: Team[]): MemberLoad[] {
  const allMembers = teams.flatMap((t) => t.members);
  if (!sprint || allMembers.length === 0) {
    return [];
  }

  const loads: Record<string, MemberLoad> = {};

  for (const member of allMembers) {
    loads[member.id] = {
      memberId: member.id,
      fullName: member.fullName,
      plannedHours: 0,
      capacityHours: member.weeklyCapacityHours,
      utilization: 0,
    };
  }

  for (const task of sprint.tasks) {
    if (!task.assigneeId || task.estimateHours <= 0) continue;
    const load = loads[task.assigneeId];
    if (!load) continue;
    load.plannedHours += task.estimateHours;
  }

  Object.values(loads).forEach((load) => {
    load.utilization = load.capacityHours > 0 ? load.plannedHours / load.capacityHours : 0;
  });

  return Object.values(loads);
}
