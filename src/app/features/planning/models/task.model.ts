// src/app/features/planning/models/task.model.ts
export type TaskStatus = 'planned' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  estimateHours: number;
  assigneeId: string | null; // member.id
  status: TaskStatus;
}
