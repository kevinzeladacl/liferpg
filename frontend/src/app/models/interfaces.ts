export interface User {
  id: number;
  email: string;
  username: string;
  level: number;
  current_xp: number;
  total_xp: number;
  avatar_url?: string;
  title: string;
  created_at: string;
}

export interface UserStats {
  level: number;
  current_xp: number;
  xp_to_next_level: number;
  total_xp: number;
  title: string;
  tasks_completed: number;
  current_streak: number;
  best_streak: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  base_xp: number;
}

export enum FrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ONCE = 'once'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Task {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description?: string;
  frequency: FrequencyType;
  status: TaskStatus;
  xp_reward: number;
  difficulty: number;
  current_streak: number;
  best_streak: number;
  created_at: string;
  due_date?: string;
  last_completed?: string;
  is_active: boolean;
  category?: Category;
}

export interface TaskCreate {
  title: string;
  description?: string;
  category_id: number;
  frequency: FrequencyType;
  xp_reward?: number;
  difficulty?: number;
  due_date?: string;
}

export interface TaskCompletion {
  id: number;
  task_id: number;
  completed_at: string;
  xp_earned: number;
  streak_bonus: number;
  new_level?: number;
  level_up: boolean;
}

export interface DashboardStats {
  user: User;
  stats: UserStats;
  today_tasks: Task[];
  recent_completions: TaskCompletion[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
