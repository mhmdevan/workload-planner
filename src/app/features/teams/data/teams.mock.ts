// src/app/features/teams/data/teams.mock.ts
import { Team } from '../models/team.model';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Core Platform',
    code: 'CORE',
    isActive: true,
    members: [
      {
        id: 'm-1',
        fullName: 'Alice Johnson',
        role: 'developer',
        skills: ['Angular', 'RxJS', 'NgRx'],
        weeklyCapacityHours: 32,
        active: true,
      },
      {
        id: 'm-2',
        fullName: 'Bob Smith',
        role: 'qa',
        skills: ['Cypress', 'Playwright'],
        weeklyCapacityHours: 24,
        active: true,
      },
    ],
  },
  {
    id: 'team-2',
    name: 'Data & Analytics',
    code: 'DATA',
    isActive: true,
    members: [
      {
        id: 'm-3',
        fullName: 'Carol White',
        role: 'developer',
        skills: ['Python', 'Airflow', 'DBT'],
        weeklyCapacityHours: 36,
        active: true,
      },
    ],
  },
  {
    id: 'team-3',
    name: 'Legacy Migration',
    code: 'LEG',
    isActive: false,
    members: [],
  },
];
