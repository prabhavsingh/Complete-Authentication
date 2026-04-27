# Authentication Service

A Node.js/TypeScript-based authentication service supporting JWT, email verification, password reset, Google OAuth, and 2FA (TOTP). Built with Express and Mongoose.

## Project Structure

```
.
├── script/
│   └── totp-qr.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       └── auth.schema.ts
│   ├── interfaces/
│   │   └── user.interface.ts
│   ├── lib/
│   │   ├── appError.ts
│   │   ├── catchAsyncError.ts
│   │   ├── email.ts
│   │   ├── globalErrorHandler.ts
│   │   └── token.ts
│   ├── middleware/
│   │   ├── requireAuth.ts
│   │   └── requireRole.ts
│   ├── models/
│   │   └── user.model.ts
│   └── routes/
│       ├── admin.routes.ts
│       ├── auth.routes.ts
│       └── user.routes.ts
├── .env
├── package.json
├── tsconfig.json
└── ...
```

## Key Features

- **User Registration & Login** (with JWT)
- **Email Verification**
- **Password Reset via Email**
- **Google OAuth 2.0 Login**
- **Two-Factor Authentication (2FA) with TOTP**
- **Role-based Access Control (admin/user)**
- **Secure password hashing (bcrypt)**
- **Centralized error handling**

## Main Components

### Entry Points

- **src/server.ts**: Loads environment, connects to MongoDB, starts HTTP server.
- **src/app.ts**: Configures Express app, routes, error handling.

### Configuration

- **src/config/db.ts**: MongoDB connection logic using Mongoose.

### Models

- **src/models/user.model.ts**: User schema with password hashing, 2FA, password reset, and role fields.

### Controllers & Schemas

- **src/controllers/auth/auth.controller.ts**: All authentication logic (register, login, Google OAuth, 2FA, etc).
- **src/controllers/auth/auth.schema.ts**: Zod schemas for validating auth-related requests.

### Middleware

- **requireAuth.ts**: JWT authentication guard.
- **requireRole.ts**: Role-based access control.

### Utilities

- **lib/appError.ts**: Custom error class.
- **lib/catchAsyncError.ts**: Async error wrapper for controllers.
- **lib/email.ts**: Nodemailer-based email sending.
- **lib/globalErrorHandler.ts**: Centralized error handler.
- **lib/token.ts**: JWT token creation/verification.

### Routes

- **auth.routes.ts**: Auth endpoints (register, login, Google, 2FA, etc).
- **user.routes.ts**: User profile endpoint.
- **admin.routes.ts**: Admin-only user listing.

### Scripts

- **script/totp-qr.ts**: Generates a QR code for TOTP 2FA setup.

## Environment Variables

See `.example.env` for all required variables (MongoDB URI, JWT secrets, email credentials, Google OAuth keys, etc).

## Scripts

- `npm run dev` — Start in development mode (with tsx)
- `npm run build` — Compile TypeScript
- `npm start` — Run compiled server

## API Overview

- `POST /auth/register` — Register new user
- `POST /auth/login` — Login
- `POST /auth/refresh` — Refresh JWT
- `GET /auth/verify-email` — Email verification
- `POST /auth/forgot-password` — Request password reset
- `POST /auth/reset-password` — Reset password
- `GET /auth/google` — Google OAuth start
- `GET /auth/google/callback` — Google OAuth callback
- `POST /auth/2fa/setup` — Setup 2FA (TOTP)
- `POST /auth/2fa/verify` — Verify 2FA code
- `GET /user/me` — Get current user (auth required)
- `GET /admin/users` — List all users (admin only)

## How to Run

1. Clone the repo and install dependencies.
2. Copy `.env` and fill in your secrets.
3. Run `npm run dev` for development or `npm start` after building.
