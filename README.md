# Healthcare Management System (HMS) — Production Ready

A complete, production-ready healthcare management platform with 9 user roles, real-time updates, and full clinical workflows.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Vercel        │──────▶│  Node.js/NestJS │──────▶│  Supabase       │
│   (Frontend)    │      │  (Backend API)  │      │  (PostgreSQL)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │
        │                        │
   HTTPS/WSS              HTTPS/REST
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Zustand |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | Supabase PostgreSQL |
| Real-time | Socket.IO (works without Redis in single-instance) |
| Auth | JWT + Argon2 + Refresh Tokens |
| Email | SMTP (SendGrid/Mailgun/AWS SES for production) |
| Hosting | Vercel (frontend) + Render/Railway (backend) |

## Project Structure

```
healthcare-platform/
├── frontend/                 # React app (deploy to Vercel)
│   ├── src/
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── backend/                  # NestJS API (deploy to Render/Railway)
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma    # 30+ database models
│   │   └── seed.ts          # Demo data
│   ├── .env.example
│   └── package.json
├── docker-compose.yml        # LOCAL DEV: PostgreSQL + Redis
└── README.md
```

---

## Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone <your-repo>
cd healthcare-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Local Database (Optional)

If you want to use local PostgreSQL instead of Supabase:

```bash
cd ..
docker compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3001

# Local PostgreSQL (from docker-compose)
DATABASE_URL=postgresql://hms_user:hms_password@localhost:5432/healthcare_db

# OR Supabase (see Production Setup below)
# DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# Redis (optional - leave empty if not running)
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-another-32-char-secret

# Email (leave SMTP_USER empty for console logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Healthcare HMS <noreply@yourdomain.com>

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Setup Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

### 5. Start Backend

```bash
cd backend
npm run start:dev
```

Backend runs at: http://localhost:3001

Test health endpoint:
```bash
curl http://localhost:3001/api/health
```

### 6. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Production Deployment

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Project API keys**
3. Go to Project Settings → Database → Connection String
4. Copy the **URI** connection string (replace `[YOUR-PASSWORD]` with your actual password)

Example:
```
postgresql://postgres:YOUR_PASSWORD@db.abc123xyz.supabase.co:5432/postgres
```

### Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render assigns this automatically) |
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres` |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Generate: `openssl rand -base64 32` |
| `FRONTEND_URL` | `https://your-project.vercel.app` (update after Vercel deploy) |
| `SMTP_HOST` | Your email provider host |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email username |
| `SMTP_PASS` | Your email password/app password |
| `SMTP_FROM` | `Healthcare HMS <noreply@yourdomain.com>` |

5. Deploy! Render will build and start your backend.
6. Note your backend URL: `https://your-backend.onrender.com`

### Step 3: Run Database Migrations on Supabase

```bash
# Locally, with your Supabase DATABASE_URL set in backend/.env
npx prisma migrate deploy
npx prisma db seed
```

Or use Render Shell:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |
| `VITE_WS_URL` | `wss://your-backend.onrender.com` |

4. Deploy! Vercel will build and host your frontend.
5. Note your Vercel URL: `https://your-project.vercel.app`

### Step 5: Update Backend CORS

Go back to Render dashboard → your backend service → Environment:

Update `FRONTEND_URL` to your actual Vercel URL:
```
FRONTEND_URL=https://your-project.vercel.app
```

Redeploy the backend (Render auto-redeploys on env change).

### Step 6: Verify Production

```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/health

# Test login
# Open https://your-project.vercel.app
# Login with: superadmin@hms.com / password123
```

---

## Environment Variables Reference

### Frontend (.env)

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_URL` | `http://localhost:3001/api` | `https://your-backend.onrender.com/api` |
| `VITE_WS_URL` | `ws://localhost:3001` | `wss://your-backend.onrender.com` |

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | Server port (Render sets this) |
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `REDIS_URL` | No | Redis URL (optional, leave empty if not used) |
| `JWT_SECRET` | Yes | 32+ character random string |
| `JWT_REFRESH_SECRET` | Yes | 32+ character random string |
| `FRONTEND_URL` | Yes | Vercel frontend URL for CORS |
| `SMTP_HOST` | No | Email server host |
| `SMTP_PORT` | No | Email server port |
| `SMTP_USER` | No | Email username |
| `SMTP_PASS` | No | Email password |
| `SMTP_FROM` | No | From email address |

---

## Development Credentials

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@hms.com` | `password123` |
| Admin | `admin@hms.com` | `password123` |
| Doctor | `dr.sharma@hms.com` | `password123` |
| Nurse | `nurse.neha@hms.com` | `password123` |
| Receptionist | `reception1@hms.com` | `password123` |
| Lab Technician | `lab.tech@hms.com` | `password123` |
| Pharmacist | `pharma@hms.com` | `password123` |
| Billing Staff | `billing@hms.com` | `password123` |
| Patient | `patient1@hms.com` | `password123` |

**⚠️ Change these passwords in production.**

---

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/verify-email
```

### Core Modules
```
GET    /api/users/profile
PATCH  /api/users/profile
GET    /api/patients/dashboard
GET    /api/patients/records
GET    /api/patients/doctors
GET    /api/doctors/dashboard
POST   /api/doctors/availability
POST   /api/doctors/prescriptions
POST   /api/doctors/lab-orders
GET    /api/appointments
POST   /api/appointments
PATCH  /api/appointments/:id/cancel
POST   /api/appointments/:id/check-in
GET    /api/encounters
PATCH  /api/encounters/:id/status
GET    /api/nursing/dashboard
POST   /api/nursing/vitals
POST   /api/nursing/assessments
GET    /api/lab/dashboard
POST   /api/lab/results
PATCH  /api/lab/results/:id/verify
GET    /api/pharmacy/dashboard
POST   /api/pharmacy/dispensing
GET    /api/billing/dashboard
POST   /api/billing/invoices
POST   /api/billing/invoices/:id/pay
GET    /api/admin/dashboard
POST   /api/admin/staff
GET    /api/admin/doctors
PATCH  /api/admin/doctors/:id/verify
GET    /api/audit/logs
```

---

## Security Checklist

- [ ] `JWT_SECRET` is 32+ random characters
- [ ] `JWT_REFRESH_SECRET` is different from `JWT_SECRET`
- [ ] `.env` files are in `.gitignore`
- [ ] `FRONTEND_URL` is set to your actual Vercel domain (not `*`)
- [ ] `SMTP_PASS` is an app password (not your main password)
- [ ] Database password is strong
- [ ] Seed credentials are changed in production
- [ ] `NODE_ENV=production` on Render
- [ ] HTTPS is enforced on Vercel

---

## Troubleshooting

### CORS Errors
Make sure `FRONTEND_URL` on the backend matches your actual Vercel URL exactly (including `https://`).

### Database Connection Failed
- Check `DATABASE_URL` format
- Ensure Supabase project is active
- Check if IP restrictions are blocking Render (Supabase → Settings → Database → IPv4)

### WebSocket Not Working
- Socket.IO works without Redis (single-instance mode)
- For multi-instance backend, add Redis URL
- Use `wss://` (not `ws://`) for production WebSocket

### Build Fails on Vercel
- Make sure `vite` is in `devDependencies`
- Check that `dist` folder is created by `npm run build`
- Verify `vercel.json` has correct `distDir`

### Build Fails on Render
- Make sure `ts-node` is in `devDependencies`
- Check that `prisma generate` runs before `npm run build`
- Verify `start` script points to `dist/main`

---

## License

MIT — For development and educational purposes.

## Support

For issues, check:
1. Backend health: `GET /api/health`
2. Backend logs on Render dashboard
3. Vercel deployment logs
4. Supabase database logs
