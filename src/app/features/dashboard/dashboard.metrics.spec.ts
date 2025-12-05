// src/app/features/dashboard/dashboard.metrics.spec.ts
import { calculateDashboardMetrics, DashboardMetrics } from './dashboard.metrics';
import { Team, Member } from '../teams/models/team.model';

function makeMember(partial: Partial<Member>): Member {
  return {
    id: partial.id ?? 'm1',
    fullName: partial.fullName ?? 'Test User',
    role: partial.role ?? 'developer',
    skills: partial.skills ?? [],
    weeklyCapacityHours: partial.weeklyCapacityHours ?? 40,
    active: partial.active ?? true,
    currentLoad: partial.currentLoad,
  };
}

function makeTeam(partial: Partial<Team>): Team {
  return {
    id: partial.id ?? 't1',
    name: partial.name ?? 'Core',
    code: partial.code ?? 'CORE',
    isActive: partial.isActive ?? true,
    members: partial.members ?? [],
  };
}

describe('calculateDashboardMetrics', () => {
  it('should return zeroed metrics when there are no teams', () => {
    const result: DashboardMetrics = calculateDashboardMetrics([]);

    expect(result.totalTeams).toBe(0);
    expect(result.activeTeams).toBe(0);
    expect(result.totalMembers).toBe(0);
    expect(result.averageCapacityPerMember).toBe(0);
    expect(result.rolesDistribution.length).toBe(0);
  });

  it('should aggregate team and member counts correctly', () => {
    const teams: Team[] = [
      makeTeam({
        id: 't1',
        name: 'Core',
        members: [
          makeMember({ id: 'm1', fullName: 'Alice', currentLoad: 0.8 }),
          makeMember({ id: 'm2', fullName: 'Bob', currentLoad: 0.6 }),
        ],
      }),
      makeTeam({
        id: 't2',
        name: 'QA',
        members: [makeMember({ id: 'm3', fullName: 'Charlie', currentLoad: 0.5 })],
      }),
      makeTeam({
        id: 't3',
        name: 'Empty',
        members: [],
      }),
    ];

    const result = calculateDashboardMetrics(teams);

    expect(result.totalTeams).toBe(3);
    // دو تیم عضو دارند
    expect(result.activeTeams).toBe(2);
    // ۳ عضو در مجموع
    expect(result.totalMembers).toBe(3);

    // مجموع load: 0.8 + 0.6 + 0.5 = 1.9 → میانگین روی ۳ نفر
    expect(result.averageCapacityPerMember).toBeCloseTo(1.9 / 3, 5);
  });

  it('should build role distribution based on member roles', () => {
    const teams: Team[] = [
      makeTeam({
        id: 't1',
        members: [
          makeMember({ id: 'm1', role: 'developer' }),
          makeMember({ id: 'm2', role: 'developer' }),
        ],
      }),
      makeTeam({
        id: 't2',
        members: [makeMember({ id: 'm3', role: 'qa' })],
      }),
    ];

    const result = calculateDashboardMetrics(teams);

    const devEntry = result.rolesDistribution.find((r) => r.role === 'developer');
    const qaEntry = result.rolesDistribution.find((r) => r.role === 'qa');

    expect(devEntry).toBeDefined();
    expect(devEntry!.count).toBe(2);

    expect(qaEntry).toBeDefined();
    expect(qaEntry!.count).toBe(1);
  });
});
