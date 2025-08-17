# Setup Guide

This guide provides step-by-step instructions to set up and run the Vulnerability Scanner application.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vulnerability-scanner
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

## Manual Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://vulnscanner:vulnscanner_dev@localhost:5432/vulnscanner"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=8000
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=26214400
ALLOWED_EXTENSIONS=".pdf,.docx,.xlsx,.pptx,.zip,.rar,.7z,.js,.py,.jar,.apk,.png,.jpg,.jpeg,.gif,.txt,.exe,.dll,.msi,.deb,.rpm"

# Rate Limiting
RATE_LIMIT_FILES=5
RATE_LIMIT_URLS=20
RATE_LIMIT_WINDOW_MS=60000

# Security
CORS_ORIGIN="http://localhost:3000"
ENABLE_CLAMAV=false
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

# External APIs (Optional)
SAFE_BROWSING_KEY=""
PHISHTANK_API_KEY=""

# Logging
LOG_LEVEL="info"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Database Setup

### Using PostgreSQL (Production)
1. Install PostgreSQL
2. Create database: `vulnscanner`
3. Update DATABASE_URL in .env
4. Run migrations: `npm run db:migrate`

### Using SQLite (Development)
1. Update DATABASE_URL in .env:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
2. Run migrations: `npm run db:migrate`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
# Run backend tests first
cd backend && npm test

# Then frontend tests
cd ../frontend && npm test
```

## API Testing

### Using curl
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test file upload
curl -X POST -F "file=@samples/test.pdf" http://localhost:8000/api/files/scan

# Test URL check
curl -X POST -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:8000/api/urls/check
```

### Using the API Documentation
1. Open http://localhost:8000/api/docs
2. Use the interactive Swagger UI to test endpoints

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in docker-compose.yml or .env files
   - Kill existing processes: `lsof -ti:8000 | xargs kill -9`

2. **Database connection failed**
   - Check DATABASE_URL in .env
   - Ensure database is running
   - Run migrations: `npm run db:migrate`

3. **File upload fails**
   - Check upload directory permissions
   - Verify file size limits
   - Check allowed file extensions

4. **CORS errors**
   - Update CORS_ORIGIN in backend .env
   - Ensure frontend URL matches

### Logs
```bash
# Docker logs
docker-compose logs -f

# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev
```

## Production Deployment

1. **Build the application**
   ```bash
   # Backend
   cd backend && npm run build
   
   # Frontend
   cd frontend && npm run build
   ```

2. **Set production environment variables**
   - Use strong JWT_SECRET
   - Configure production database
   - Set appropriate rate limits

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Security Notes

- Change default JWT_SECRET in production
- Use HTTPS in production
- Configure proper CORS origins
- Set appropriate file upload limits
- Monitor rate limiting
- Keep dependencies updated
