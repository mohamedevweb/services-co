import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { db } from '../index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { RegisterDto, AuthResponse } from '../dto/auth.dto.js';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = 60 * 60 * 24; // 24 hours in seconds

  async register(userData: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create new user - role is always "USER"
      const newUser = await db
        .insert(users)
        .values({
          email: userData.email,
          password: hashedPassword,
          role: 'USER', // Always set to USER
          siret: userData.siret || null
        })
        .returning();

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          id: newUser[0].id,
          email: newUser[0].email,
          role: newUser[0].role
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Internal server error during registration'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user has a password
      if (!user[0].password) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate JWT token - only id and role
      const payload = {
        id: user[0].id.toString(),
        role: user[0].role,
        iat: Math.floor(Date.now() / 1000), // Issued at
        exp: Math.floor(Date.now() / 1000) + this.JWT_EXPIRES_IN, // Expires in 24 hours
      };

      const token = await sign(payload, this.JWT_SECRET);

      return {
        success: true,
        message: 'Login successful',
        data: {
          id: user[0].id,
          email: user[0].email,
          role: user[0].role,
          token: token
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error during login'
      };
    }
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const { verify } = await import('hono/jwt');
      const payload = await verify(token, this.JWT_SECRET);
      
      return {
        success: true,
        message: 'Token is valid',
        data: payload
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Invalid or expired token'
      };
    }
  }
} 