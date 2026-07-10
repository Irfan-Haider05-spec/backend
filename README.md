# MLITech Backend API

Production-grade Node.js + TypeScript REST API backend for the MLITech loyalty & promotions platform.

---

## 🏗️ Tech Stack

| Layer | Technology |
|:---|:---|
| Runtime | Node.js 22 |
| Language | TypeScript 5 |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt sessions |
| File Uploads | Multer |
| Payments | Stripe |
| Notifications | Firebase FCM |
| SMS | Twilio |
| Email | Nodemailer (SMTP) |
| Process Manager | PM2 |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Web Server | Nginx + Let's Encrypt |

---

## 📚 Documentation

| Guide | Description |
|:---|:---|
| [📦 Deployment Guide](./docs/DEPLOYMENT.md) | Step-by-step server setup & production deployment |
| [🐳 Docker Guide](./docs/DOCKER.md) | Docker & Docker Compose usage |
| [⚙️ CI/CD Guide](./docs/CI_CD.md) | GitHub Actions pipeline setup |
| [🗄️ Database Guide](./docs/DATABASE.md) | MongoDB schema, indexes & migration |
| [🔐 Environment Variables](./docs/ENV.md) | All environment variables reference |
| **Phase 1: Integrations** | |
| [🔄 Integration Flows](./docs/Phase-1-Integrations/integration-flows.md) | OTP verification, checkout request-approval, and Stripe webhook flows |
| [🔌 SDKs & Services Guide](./docs/Phase-1-Integrations/integrations.md) | Stripe, Firebase, Twilio, VeevoTech, M3, Google OAuth, and Analytics services |
| **Phase 2: Security & Credentials** | |
| [🔑 Credentials Handover](./docs/Phase-2-Security/credentials-handover.md) | Key rotation protocols and platform ownership handover guidelines |
| [🛡️ Security Policy](./docs/Phase-2-Security/security-policy.md) | JWT parameters, session validation checks, RBAC, AES encryption configs |


---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 22+
- npm (`npm install -g npm`)
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and fill in required values
```

### 3. Run Development Server

```bash
npm run dev
# Server starts at http://localhost:5004
```

### 4. Build for Production

```bash
npm run build
# Compiled JS output in ./dist/
```

---

## 🐳 Quick Start (Docker)

```bash
cp .env.example .env
# Fill in .env values

docker compose up -d --build
# Backend: http://localhost:5004
# MongoDB: mongodb://localhost:27017
```

---

## 📁 Project Structure

```
.
├── src/                        # TypeScript source code
│   ├── app/
│   │   ├── middlewares/        # Auth, error handling, rate limiting
│   │   ├── modules/            # Feature modules (user, auth, merchant, etc.)
│   │   └── routes/             # Route aggregator
│   ├── config/                 # App configuration & env loading
│   ├── enums/                  # TypeScript enums
│   ├── errors/                 # Custom error classes
│   ├── helpers/                # JWT, email, notification helpers
│   ├── shared/                 # Shared utilities
│   ├── utils/                  # General utilities
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── dist/                       # Compiled JavaScript (generated)
├── docs/                       # Project documentation
├── setup/                      # Server setup scripts
├── uploads/                    # User uploaded files (runtime)
├── .github/workflows/          # GitHub Actions CI/CD
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Local dev orchestration
├── ecosystem.config.js         # PM2 process configuration
├── .env.example                # Environment variable template
└── tsconfig.json               # TypeScript configuration
```

---

## 🔑 Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server (`node dist/server.js`) |

---

## 🔒 Security Features

- JWT access + refresh token authentication
- bcrypt-hashed session IDs
- Helmet.js security headers
- Express rate limiting
- MongoDB query sanitization (express-mongo-sanitize)
- XSS protection (xss-clean)
- CORS whitelist
- Non-root Docker user

---

## 📄 License

ISC — Md Mahabub Rahman
