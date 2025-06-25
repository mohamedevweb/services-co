export interface RegisterDto {
  email: string;
  password: string;
  siret?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
} 