// src/app/features/planning/models/sprint.model.ts
import { Task } from './task.model';

export interface Sprint {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  tasks: Task[];
}
