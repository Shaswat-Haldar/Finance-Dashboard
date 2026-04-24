# Financial Analytics Platform

A production-grade, full-stack personal finance application designed for scalability, security, and high performance. Built with a modern **React 19** frontend, a high-speed **Hono (Node.js)** API, and a persistent **PostgreSQL** database managed via **Drizzle ORM**.

---

## 🚀 Key Features

- **End-to-End Authentication**: Secure user registration and login with JWT-based sessions and Bcrypt password hashing.
- **Real-Time Financial Analytics**: Dynamic summary cards (Balance, Income, Expenses), cumulative net trend charts, and category performance breakdown.
- **Transaction Management**: Full CRUD operations with advanced server-side validation using Zod.
- **Role-Based Access Control (RBAC)**: Distinct `Admin` (full management) and `Viewer` (read-only) roles persisted in the database.
- **Futuristic UI/UX**: Ultra-responsive layout with Dark Mode, Glassmorphism effects, glass-morphic components, and smooth micro-animations.
- **Data Persistence**: Containerized PostgreSQL database ensures your financial records are never lost.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Zustand (with Persistence)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Client**: Fetch API with custom interceptors

### Backend
- **Runtime**: Node.js
- **API Framework**: Hono (Ultra-fast, TypeScript-native)
- **Database**: PostgreSQL (v16)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Auth**: JWT (jose), Bcrypt.js

### Infrastructure
- **Containerization**: Docker Desktop (Postgres instance)
- **Database Tooling**: Drizzle Kit (Migrations & Studio)

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v20+ recommended)
- **Docker Desktop** (Started and running)

### 1. Database Setup (Docker)

Launch the PostgreSQL instance from the root directory:

```bash
docker compose up -d
```

### 2. Backend Installation & Sync

```bash
cd backend
npm install

# Apply database schema
npx tsx src/db/migrate.ts

# (Optional) Seed the database with demo data
npm run db:seed

# Start the API
npm run dev
```

*The API will be available at `http://localhost:3001`*

### 3. Frontend Installation

Open a new terminal in the root directory:

```bash
npm install
npm run dev
```

*The Dashboard will be available at `http://localhost:5173`*

---

## 🔑 Authentication Credentials (Demo)

If you seeded the database, use these to explore the full admin experience:

- **Email**: `demo@zuvlyn.com`
- **Password**: `Demo1234!`

---

## 📂 Project Structure

```text
finance-dashboard/
├── backend/                # Hono API + Drizzle Schema
│   ├── src/
│   │   ├── db/             # Schema & DB Connection
│   │   ├── lib/            # JWT & Hashing Helpers
│   │   ├── middleware/     # Auth Protection
│   │   └── routes/         # Auth, Transaction, Analytics API
│   ├── drizzle/            # SQL Migrations
│   └── docker-compose.yml  # Database config
├── src/                    # React Frontend
│   ├── api/                # API Fetch Client
│   ├── store/              # Zustand Auth & Data Store
│   ├── components/         # Premium UI Components
│   └── hooks/              # Filtering & Aggregation Hooks
└── README.md
```

---

## 📊 Database Management

Use **Drizzle Studio** to visually explore and edit your PostgreSQL data:

```bash
cd backend
npm run db:studio
```

---

## 🛡️ Security Implementation

- **Password Hashing**: 12-round salt hashing for all user credentials.
- **JWT Protection**: Stateless auth using `jose` with HS256 signing.
- **API Validation**: Strict typing on all incoming JSON bodies via `zod`.
- **RBAC Middleware**: High-order middleware protects routes based on User ID and Role.

---

## 📝 License

This project is intended for portfolio and evaluation purposes. All rights reserved.
