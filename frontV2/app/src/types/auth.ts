export interface User {
  id: number;
  email: string;
  role: string;
  organizationId?: number;
  prestataireId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  siret?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
    role: string;
    token: string;
  };
}

export interface LoginResult {
  success: boolean;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (newToken: string, newRole: string, entityId?: number) => void;
  loading: boolean;
} 