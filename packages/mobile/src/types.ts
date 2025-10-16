export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TaskRequest {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface ApiError {
  error?: string;
  message?: string;
}
