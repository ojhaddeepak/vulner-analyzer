# Deployment Guide for Security Analyzer

## Step 1: Push to GitHub Repository

### Initialize Git and Push to GitHub

```bash
# Navigate to your project directory
cd "h:\vulnerablity scanner"

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Vulnerability Scanner with React frontend and Node.js backend"

# Add GitHub remote (replace with your actual repository)
git remote add origin https://github.com/ojhaddeepak/security-analyzer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your personal account
# - Link to existing project? No
# - Project name: security-analyzer
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `ojhaddeepak/security-analyzer`
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm run install-all`

## Step 3: Environment Variables

Set these environment variables in Vercel Dashboard:

### Frontend Environment Variables
```
VITE_API_URL=https://your-vercel-app.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

### Backend Environment Variables (if using separate backend)
```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
SAFE_BROWSING_KEY=your_google_safe_browsing_api_key
```

## Step 4: Verify Deployment

After deployment, your app will be available at:
- **Production URL**: `https://security-analyzer-[random].vercel.app`
- **API Endpoints**: `https://your-app.vercel.app/api/*`

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in package.json
2. **API Routes Not Working**: Verify vercel.json configuration
3. **Environment Variables**: Ensure all required env vars are set in Vercel dashboard

### Build Commands Reference:
- **Install**: `npm run install-all`
- **Build**: `npm run build`
- **Start**: `npm start`

## Project Structure for Vercel

```
/
├── api/                 # Vercel serverless functions
├── frontend/           # React app (builds to frontend/dist)
├── backend/           # Node.js backend (for reference)
├── vercel.json        # Vercel configuration
├── package.json       # Root package.json with build scripts
└── README.md
```

## Next Steps

1. Push code to GitHub using the commands above
2. Deploy to Vercel using either CLI or dashboard
3. Configure environment variables
4. Test the deployed application
5. Set up custom domain (optional)

Your vulnerability scanner will be live and accessible worldwide!
