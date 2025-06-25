import { Hono } from 'hono';
import { guard } from '../middleware/auth.middleware.js';
import { getUserId, getUserRole, getUserInfo } from '../utils/jwt.utils.js';

const protectedRoutes = new Hono();

// Protected route - accessible to all authenticated users
protectedRoutes.get('/profile', guard, async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) return c.json("Token is missing", 401);

    const userInfo = getUserInfo(token);
    
    return c.json({
      success: true,
      message: 'Profile accessed successfully',
      data: {
        id: userInfo.id,
        role: userInfo.role
      }
    });
  } catch (error) {
    return c.json({ message: 'Server error' }, 500);
  }
});

// Admin-only route
protectedRoutes.get('/admin', guard, async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) return c.json("Token is missing", 401);

    const userRole = getUserRole(token);
    if (userRole !== 'ADMIN') {
      return c.json({ message: 'Insufficient permissions' }, 403);
    }

    return c.json({
      success: true,
      message: 'Admin dashboard accessed successfully',
      data: {
        message: 'Welcome to admin dashboard'
      }
    });
  } catch (error) {
    return c.json({ message: 'Server error' }, 500);
  }
});

// Organization-only route
protectedRoutes.get('/organization', guard, async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) return c.json("Token is missing", 401);

    const userRole = getUserRole(token);
    if (userRole !== 'ORG') {
      return c.json({ message: 'Insufficient permissions' }, 403);
    }

    return c.json({
      success: true,
      message: 'Organization dashboard accessed successfully',
      data: {
        message: 'Welcome to organization dashboard'
      }
    });
  } catch (error) {
    return c.json({ message: 'Server error' }, 500);
  }
});

// Prestataire-only route
protectedRoutes.get('/prestataire', guard, async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) return c.json("Token is missing", 401);

    const userRole = getUserRole(token);
    if (userRole !== 'PRESTA') {
      return c.json({ message: 'Insufficient permissions' }, 403);
    }

    return c.json({
      success: true,
      message: 'Prestataire dashboard accessed successfully',
      data: {
        message: 'Welcome to prestataire dashboard'
      }
    });
  } catch (error) {
    return c.json({ message: 'Server error' }, 500);
  }
});

// User-only route
protectedRoutes.get('/user', guard, async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) return c.json("Token is missing", 401);

    const userRole = getUserRole(token);
    if (userRole !== 'USER') {
      return c.json({ message: 'Insufficient permissions' }, 403);
    }

    return c.json({
      success: true,
      message: 'User dashboard accessed successfully',
      data: {
        message: 'Welcome to user dashboard'
      }
    });
  } catch (error) {
    return c.json({ message: 'Server error' }, 500);
  }
});

// Route accessible to both ORG and PRESTA
protectedRoutes.get('/shared', guard, async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) return c.json("Token is missing", 401);

    const userRole = getUserRole(token);
    if (!['ORG', 'PRESTA'].includes(userRole)) {
      return c.json({ message: 'Insufficient permissions' }, 403);
    }

    return c.json({
      success: true,
      message: 'Shared resource accessed successfully',
      data: {
        message: 'This resource is shared between organizations and prestataires'
      }
    });
  } catch (error) {
    return c.json({ message: 'Server error' }, 500);
  }
});

export default protectedRoutes; 