// src/app/features/dashboard/dashboard.metrics.ts
import { Team, Member } from '../teams/models/team.model';

export interface RoleDistributionEntry {
  role: string;
  count: number;
}

export interface DashboardMetrics {
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  averageCapacityPerMember: number;
  rolesDistribution: RoleDistributionEntry[];
}

export function calculateDashboardMetrics(teams: Team[]): DashboardMetrics {
  const totalTeams = teams.length;

  const activeTeams = teams.filter((t) => t.members.length > 0).length;

  const allMembers: Member[] = teams.flatMap((t) => t.members);
  const totalMembers = allMembers.length;

  const totalLoad = allMembers.reduce((sum, m) => sum + (m.currentLoad ?? 0), 0);
  const averageCapacityPerMember = totalMembers ? totalLoad / totalMembers : 0;

  const roleCounts = new Map<string, number>();

  for (const member of allMembers) {
    const role = (member as any).role ?? 'unknown';
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }

  const rolesDistribution: RoleDistributionEntry[] = Array.from(roleCounts.entries()).map(
    ([role, count]) => ({ role, count })
  );

  return {
    totalTeams,
    activeTeams,
    totalMembers,
    averageCapacityPerMember,
    rolesDistribution,
  };
}
