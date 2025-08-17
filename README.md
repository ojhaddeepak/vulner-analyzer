# Vulnerability Scanner Web Application

A defensive web application for file analysis and URL phishing detection. This tool provides risk assessment through static analysis without executing any uploaded content.

## 🚀 Features

### File Analysis
- **Multi-format Support**: PDF, Office documents, executables, archives, images, scripts
- **Hash Generation**: MD5, SHA-1, SHA-256 for all uploaded files
- **Static Analysis**: Detects macros, embedded content, suspicious patterns
- **Risk Scoring**: 0-100 score with detailed explanations
- **Metadata Extraction**: Safe extraction of file properties

### URL Phishing Detection
- **SSL/TLS Analysis**: Certificate validation and security headers
- **Domain Intelligence**: WHOIS data, domain age, DNS records
- **URL Heuristics**: Look-alike detection, suspicious patterns
- **Content Analysis**: Form analysis, JavaScript obfuscation detection
- **Confidence Scoring**: Explainable classification with reasons

### Security & Privacy
- **No Execution**: Files are never executed, only analyzed as data
- **Rate Limiting**: Configurable limits per endpoint
- **Auto-cleanup**: Uploads deleted after 24 hours
- **GDPR Compliant**: Data deletion endpoints available

## 🛠 Tech Stack

- **Frontend**: React + Vite + TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js + Express + TypeScript, Prisma ORM
- **Database**: PostgreSQL (production) / SQLite (development)
- **Infrastructure**: Docker + docker-compose
- **Testing**: Jest + Vitest + React Testing Library

## 📦 Quick Start

### Using Docker (Recommended)

```bash
# Clone and setup
git clone <repository-url>
cd vulnerability-scanner

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Manual Setup

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vulnscanner"

# JWT
JWT_SECRET="your-secret-key"

# Rate Limits
RATE_LIMIT_FILES=5
RATE_LIMIT_URLS=20

# Optional: Google Safe Browsing API
SAFE_BROWSING_KEY="your-api-key"
```

## 📊 API Documentation

Interactive API documentation is available at `/api/docs` when the backend is running.

### Key Endpoints

- `POST /api/files/scan` - Upload and analyze files
- `POST /api/url/check` - Check URL for phishing indicators
- `GET /api/files/:id` - Retrieve file analysis results
- `GET /api/urls/:id` - Retrieve URL check results

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📁 Project Structure

```
/
├── frontend/          # React application
├── backend/           # Node.js API server
├── rules/            # Analysis rules engine
├── scripts/          # Utility scripts
├── samples/          # Example files and outputs
├── docker-compose.yml
└── README.md
```

## 🔒 Security Considerations

- Files are never executed or opened in applications
- All analysis is performed on file bytes/strings only
- Uploads are stored outside web root
- Rate limiting prevents abuse
- Input validation on all endpoints
- No sensitive data logged

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## ⚠️ Disclaimer

This tool provides guidance only and is not a definitive security verdict. Always use multiple tools and human judgment for critical security decisions.
