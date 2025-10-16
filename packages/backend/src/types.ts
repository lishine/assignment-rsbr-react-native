export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
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
  user: Omit<User, 'password'>;
}

export interface TaskRequest {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
}
