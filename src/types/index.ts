export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  MEMBER = "member",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkflowStage {
  _id: string;
  name: string;
  order: number;
  color?: string;
}

export interface IWorkflow {
  _id: string;
  name: string;
  stages: IWorkflowStage[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog {
  action: string;
  userId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  currentStage: string;
  assignedUsers: string[];
  dueDate: Date;
  workflowId: string;
  projectId?: string;
  createdBy: string;
  completedAt?: Date;
  activityLog: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: Date;
}
