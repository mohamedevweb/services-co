import { Hono } from 'hono';
import { AuthService } from '../services/auth.service.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import type { RegisterDto } from '../dto/auth.dto.js';

const auth = new Hono();
const authService = new AuthService();

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json() as RegisterDto;
    
    // Basic validation
    if (!body.email || !body.password) {
      return c.json({
        success: false,
        message: 'Email and password are required'
      }, 400);
    }

    // Email validation
    if (!validateEmail(body.email)) {
      return c.json({
        success: false,
        message: 'Invalid email format'
      }, 400);
    }

    // Password validation
    if (!validatePassword(body.password)) {
      return c.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, 400);
    }

    const result = await authService.register(body);
    
    if (result.success) {
      return c.json(result, 201);
    } else {
      return c.json(result, 400);
    }
  } catch (error) {
    console.error('Register route error:', error);
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.email || !body.password) {
      return c.json({
        success: false,
        message: 'Email and password are required'
      }, 400);
    }

    const result = await authService.login(body.email, body.password);
    
    if (result.success) {
      return c.json(result, 200);
    } else {
      return c.json(result, 401);
    }
  } catch (error) {
    console.error('Login route error:', error);
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500);
  }
});

// Verify token endpoint
auth.post('/verify', async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.token) {
      return c.json({
        success: false,
        message: 'Token is required'
      }, 400);
    }

    const result = await authService.verifyToken(body.token);
    
    if (result.success) {
      return c.json(result, 200);
    } else {
      return c.json(result, 401);
    }
  } catch (error) {
    console.error('Token verification route error:', error);
    return c.json({
      success: false,
      message: 'Internal server error'
    }, 500);
  }
});

export default auth; 