# Authentication Setup Guide

This guide explains how to set up OAuth authentication with Google and GitHub for the vulnerability scanner application.

## Features Implemented

✅ **Login Page** (`/login`) with:
- Email/password authentication
- Google OAuth integration
- GitHub OAuth integration
- Form validation with Zod
- Beautiful UI with Tailwind CSS

✅ **Signup Page** (`/signup`) with:
- Email/password registration
- Google OAuth signup
- GitHub OAuth signup
- Password strength validation
- Confirm password validation

✅ **Authentication Service** (`src/lib/auth.ts`):
- Centralized auth management
- OAuth flow handling
- Local storage session management
- Toast notifications for user feedback

✅ **OAuth Callback Handler** (`/auth/callback`):
- GitHub OAuth callback processing
- State validation for security
- Automatic redirection after auth

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Add your OAuth credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_API_URL=http://localhost:3001
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://your-domain.com` (for production)
7. Copy the Client ID to your `.env` file

### 3. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Vulnerability Scanner
   - **Homepage URL**: `http://localhost:5173` (development) or your domain
   - **Authorization callback URL**: `http://localhost:5173/auth/callback`
4. Copy the Client ID to your `.env` file

### 4. Install Dependencies

The following dependencies have been added to `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "firebase": "^10.7.1"
  }
}
```

Install them:

```bash
cd frontend
npm install
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Accessing Auth Pages

- **Login**: Navigate to `/login`
- **Signup**: Navigate to `/signup`
- **Home**: Navigate to `/` (main app)

### Authentication Flow

1. **Email/Password**: 
   - Enter credentials and submit
   - Mock authentication (replace with real API calls)

2. **Google OAuth**:
   - Click "Continue with Google"
   - Google popup/redirect for authentication
   - Automatic login and redirect to home

3. **GitHub OAuth**:
   - Click "Continue with GitHub"
   - Redirect to GitHub for authorization
   - Return to `/auth/callback` for processing
   - Automatic login and redirect to home

### Session Management

- User sessions are stored in `localStorage`
- Sessions persist across browser refreshes
- Call `authService.logout()` to clear session

## Code Structure

```
frontend/src/
├── lib/
│   ├── auth.ts          # Authentication service
│   └── env.d.ts         # Environment type definitions
├── pages/
│   ├── LoginPage.tsx    # Login page with OAuth
│   ├── SignupPage.tsx   # Signup page with OAuth
│   └── AuthCallbackPage.tsx # OAuth callback handler
└── App.tsx              # Updated routing
```

## Security Considerations

1. **State Parameter**: GitHub OAuth uses state parameter for CSRF protection
2. **Environment Variables**: Keep OAuth secrets secure
3. **HTTPS**: Use HTTPS in production
4. **Token Validation**: Implement proper token validation on backend

## Next Steps

1. **Backend Integration**: Replace mock authentication with real API calls
2. **Token Management**: Implement JWT token handling
3. **Protected Routes**: Add route guards for authenticated pages
4. **User Profile**: Add user profile management
5. **Password Reset**: Implement password reset functionality

## Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**: Ensure callback URLs match in OAuth app settings
2. **Environment Variables**: Check that `.env` file is properly loaded
3. **CORS Issues**: Configure CORS on your backend API
4. **TypeScript Errors**: Run `npm install` to ensure all dependencies are installed

### Development vs Production

- Update OAuth callback URLs for production deployment
- Use environment-specific configuration
- Ensure HTTPS is enabled in production
