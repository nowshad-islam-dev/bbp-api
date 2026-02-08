# BBP API

**Ballot Beyond Politics API** - A robust REST API built with Express.js and TypeScript for managing candidates, events, news, comments, and user authentication.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)
- [Scripts](#scripts)

## 🎯 Features

- **Authentication & Authorization**: JWT-based auth with access and refresh tokens
- **User Management**: User registration, login, password reset, email verification
- **Content Management**: Create and manage candidates, news, events, and comments
- **Email Service**: Email verification and password reset notifications
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: Global and endpoint-specific rate limiting
- **Security**: CORS, security headers, input validation, request sanitization
- **Database Migrations**: Drizzle ORM with automated migrations
- **Logging**: Structured logging with request tracking
- **Image Management**: ImageKit integration for media handling
- **Production Ready**: PM2 process management, error handling, performance monitoring

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL/MariaDB with Drizzle ORM
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **Email**: Nodemailer
- **Media**: ImageKit
- **Process Manager**: PM2
- **Package Manager**: pnpm
- **Linting**: ESLint with Prettier
- **Server**: Nginx (reverse proxy)

## 📦 Prerequisites

- Node.js >= 18.x
- pnpm >= 8.x (or npm/yarn)
- MySQL/MariaDB 10.11+
- Redis
- Docker & Docker Compose (optional)

## 🚀 Installation

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd bbp-api

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start services with Docker Compose
docker-compose up -d

# Run database migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed:dev
```

### Manual Setup

```bash
# Install dependencies
pnpm install

# Ensure MySQL and Redis are running locally
# Update DATABASE_URL and REDIS_URL in .env accordingly

# Run migrations
pnpm db:migrate

# Build the project
pnpm build
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
APP_NAME=BBP API
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mysql://user:password@localhost:3306/bbp_db

# Redis
REDIS_URL=redis://localhost:6379

# URLs
SERVER_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# JWT Secrets (use strong, random strings - minimum 32 characters)
ACCESS_TOKEN_SECRET=your_access_token_secret_min_32_chars
ACCESS_TOKEN_EXPIRY=900
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_32_chars
REFRESH_TOKEN_EXPIRY=604800

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx

# Email Token Expiry
EMAIL_VERIFICATION_TOKEN_EXPIRY=3600

# SMTP Configuration (for email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@bbpapi.com
```

## 🗄️ Database Setup

### Running Migrations

```bash
# Generate migration files (after schema changes)
pnpm db:generate

# Apply all pending migrations
pnpm db:migrate

# View database in studio
pnpm db:studio
```

### Seeding the Database

```bash
# Seed development data
pnpm db:seed:dev

# Seed production data
pnpm db:seed:prod

# Reset database (drops all data)
pnpm db:reset
```

## ▶️ Running the Application

### Development Mode

```bash
# Start with hot reload
pnpm dev

# API will be available at http://localhost:3000
```

### Production Build

```bash
# Build TypeScript
pnpm build

# Start the application
pnpm start

# Or with PM2
pnpm start:pm2
```

## 📁 Project Structure

```
src/
├── app.ts                      # Express app setup
├── index.ts                    # Server entry point
├── config/
│   ├── env.ts                 # Environment variables
│   └── logger.ts              # Logging configuration
├── controllers/               # Request handlers
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── candidates.controller.ts
│   ├── events.controller.ts
│   ├── news.controller.ts
│   └── comments.controller.ts
├── services/                  # Business logic
│   ├── auth.service.ts
│   ├── email.service.ts
│   └── ...
├── routes/                    # Route definitions
├── middlewares/               # Express middlewares
│   ├── authenticate.ts
│   ├── cache.ts
│   ├── errorHandler.ts
│   ├── globalRateLimiter.ts
│   ├── validateRequest.ts
│   └── ...
├── validators/                # Input validation schemas
├── db/
│   ├── index.ts              # Database connection
│   └── schema.ts             # Database schema
├── redis/                     # Redis client setup
├── helpers/                   # Utility functions
├── utils/                     # Error handling, responses
└── templates/
    └── emails/               # Email templates

drizzle/                       # Database migrations
scripts/
├── seed.dev.ts               # Development seed script
├── seed.prod.ts              # Production seed script
└── resetDB.ts                # Database reset script
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account

### Candidates

- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Create candidate (admin only)
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Events

- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### News

- `GET /api/news` - List all news articles
- `GET /api/news/:id` - Get news article details
- `POST /api/news` - Create news article
- `PUT /api/news/:id` - Update news article
- `DELETE /api/news/:id` - Delete news article

### Comments

- `GET /api/comments/:resourceId` - Get comments on a resource
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🔧 Development

### Linting

```bash
# Check for linting errors
pnpm lint

# Fix linting errors automatically
pnpm lint:fix
```

### Code Formatting

```bash
# Format all files with Prettier
pnpm format
```

### Type Checking

```bash
# Run TypeScript compiler
tsc --noEmit
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker image (if Dockerfile exists)
docker build -t bbp-api .

# Run container
docker run -p 3000:3000 --env-file .env bbp-api
```

### Nginx Configuration

The project includes an `ngninx.conf` file for reverse proxy setup. Configure your Nginx instance to forward requests to the Node.js application running on localhost:3000.

### PM2 Deployment

```bash
# Start with PM2 using ecosystem config
pnpm start:pm2

# View all running processes
pm2 list

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all

# View logs
pm2 logs bbp-api
```

## 📜 Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start development server with hot reload |
| `pnpm build`        | Build TypeScript to JavaScript           |
| `pnpm start`        | Start production server                  |
| `pnpm start:pm2`    | Start with PM2 process manager           |
| `pnpm lint`         | Run ESLint to check code quality         |
| `pnpm lint:fix`     | Fix linting errors automatically         |
| `pnpm format`       | Format code with Prettier                |
| `pnpm db:generate`  | Generate new migration                   |
| `pnpm db:migrate`   | Run pending migrations                   |
| `pnpm db:studio`    | Open Drizzle Studio                      |
| `pnpm db:seed:dev`  | Seed development data                    |
| `pnpm db:seed:prod` | Seed production data                     |
| `pnpm db:reset`     | Reset database                           |

## 📝 License

ISC

## 👤 Author

Nowshad Islam
