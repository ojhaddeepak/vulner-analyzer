# OAuth Authentication Setup Guide

This guide will help you configure Google and GitHub OAuth authentication for your vulnerability scanner application.

## Quick Setup

1. **Create Environment File**
   ```bash
   # Copy the example file
   cp frontend/.env.example frontend/.env
   ```

2. **Configure OAuth Providers** (follow sections below)

3. **Update Environment Variables** in `frontend/.env`

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API or Google Identity API

### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: "Vulnerability Scanner"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### Step 3: Create OAuth Client ID
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Set authorized origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
5. Set redirect URIs:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
6. Copy the Client ID

### Step 4: Update Environment
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - Application name: "Vulnerability Scanner"
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/auth/callback`
4. Click "Register application"
5. Copy the Client ID

### Step 2: Update Environment
```env
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

## Testing OAuth

### Development Testing
1. Start your development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to `/login` or `/signup`
3. Click on Google or GitHub buttons
4. Check browser console for any errors

### Common Issues

#### Google OAuth Issues
- **"OAuth not configured"**: Check `VITE_GOOGLE_CLIENT_ID` in `.env`
- **"Failed to load Google script"**: Check internet connection
- **"Invalid client"**: Verify Client ID and authorized origins

#### GitHub OAuth Issues
- **"OAuth not configured"**: Check `VITE_GITHUB_CLIENT_ID` in `.env`
- **"Invalid redirect URI"**: Verify callback URL matches GitHub app settings
- **"State mismatch"**: Clear localStorage and try again

### Debug Mode
Enable debug logging by opening browser console. The auth service logs all OAuth attempts and errors.

## Production Deployment

### Environment Variables
Update your production environment with:
```env
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_GITHUB_CLIENT_ID=your_production_github_client_id
VITE_API_URL=https://your-api-domain.com
```

### OAuth App Updates
1. **Google**: Add production domain to authorized origins
2. **GitHub**: Update callback URL to production domain

## Security Notes

- Never commit `.env` files to version control
- Use different OAuth apps for development and production
- Regularly rotate OAuth secrets
- Implement proper backend token validation in production

## Troubleshooting

### Clear OAuth State
If experiencing persistent issues:
```javascript
// Run in browser console
localStorage.clear()
location.reload()
```

### Check Network Requests
1. Open browser DevTools
2. Go to Network tab
3. Attempt OAuth login
4. Check for failed requests or CORS errors

### Verify Environment Loading
```javascript
// Run in browser console
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log('GitHub Client ID:', import.meta.env.VITE_GITHUB_CLIENT_ID)
```

## Support

If you continue experiencing issues:
1. Check browser console for detailed error messages
2. Verify all URLs match exactly between OAuth apps and environment
3. Ensure `.env` file is in the correct location (`frontend/.env`)
4. Try testing with a fresh browser profile
