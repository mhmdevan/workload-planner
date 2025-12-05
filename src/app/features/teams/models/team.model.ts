// src/app/features/teams/models/team.model.ts

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
