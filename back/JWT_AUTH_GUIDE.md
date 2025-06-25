# JWT Authentication Guide

## 🔐 **Overview**
This API now includes JWT (JSON Web Token) authentication for secure user sessions. When users log in, they receive a JWT token that contains their user ID, role, and email.

## 🚀 **Authentication Endpoints**

### 1. **Register** - `POST /auth/register`
Create a new user account. **All new users are automatically assigned the "USER" role.**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "siret": "12345678901234" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

### 2. **Login** - `POST /auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. **Verify Token** - `POST /auth/verify`
Verify if a JWT token is valid.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "sub": "1",
    "role": "USER",
    "email": "user@example.com",
    "iat": 1703123456,
    "exp": 1703209856
  }
}
```

## 🛡️ **Protected Routes**

All routes under `/api/*` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Available Protected Endpoints:

1. **`GET /api/profile`** - Get user profile (all authenticated users)
2. **`GET /api/admin`** - Admin dashboard (ADMIN role only)
3. **`GET /api/organization`** - Organization dashboard (ORG role only)
4. **`GET /api/prestataire`** - Prestataire dashboard (PRESTA role only)
5. **`GET /api/user`** - User dashboard (USER role only)
6. **`GET /api/shared`** - Shared resource (ORG and PRESTA roles)

## 🔧 **Environment Variables**

Add to your `.env` file:
```env
JWT_SECRET=your-super-secret-key-here
DATABASE_URL=your-database-url
```

## 📝 **JWT Token Details**

- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Payload includes**:
  - `sub`: User ID
  - `role`: User role (ADMIN, ORG, PRESTA, USER)
  - `email`: User email
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

## 🧪 **Testing with curl**

### Register a user:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login and get token:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access protected route:
```bash
curl -X GET http://localhost:3001/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔒 **Security Features**

- ✅ Password hashing with bcrypt
- ✅ JWT token expiration (24 hours)
- ✅ Role-based access control
- ✅ Token verification middleware
- ✅ Secure token storage in Authorization header
- ✅ Input validation and sanitization
- ✅ Automatic "USER" role assignment on registration

## 🚨 **Error Handling**

Common error responses:

- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **400 Bad Request**: Invalid input data
- **500 Internal Server Error**: Server-side errors

## 📋 **User Roles**

- **USER**: Default role for all new registrations
- **ORG**: Organization accounts (requires admin assignment)
- **PRESTA**: Service provider accounts (requires admin assignment)
- **ADMIN**: Administrator accounts (requires admin assignment) 