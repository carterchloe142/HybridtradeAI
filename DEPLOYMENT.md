# Deployment Guide

## 1. Environment Setup
Ensure your `.env` file (or environment variables in your hosting provider) contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g., https://your-domain.com)
- `DATABASE_URL` (for Prisma)

## 2. Pre-Deployment Checks
Run the included preflight script to verify connections:
```bash
npm run deploy:check
```

## 3. Deployment Options

### Option A: Vercel (Web Only)
The project can be deployed to Vercel for the web interface and API routes.
**Note:** Background workers (notifications) will **not run** on Vercel due to serverless limitations.

1. Connect your repository to Vercel.
2. Add the Environment Variables in the Vercel dashboard.
3. Deploy.
4. (Optional) For notifications, deploy the worker separately on a VPS or Railway.

### Option B: Docker (Full Stack - Recommended)
This project is configured for a standalone Docker build which allows running the app anywhere.

1. **Build the image**:
   ```bash
   docker build -t hybridtradeai .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL="your_url" \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
     -e SUPABASE_SERVICE_ROLE_KEY="your_role_key" \
     -e DATABASE_URL="your_db_url" \
     --name hybridtradeai hybridtradeai
   ```

### Option C: Node.js Server (VPS/PM2)
Suitable for standard Linux servers (Ubuntu/Debian).

1. **Install Dependencies**:
   ```bash
   npm ci
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Option D: Cloud PaaS (Railway/Render)
Most modern PaaS providers support Docker automatically and can run persistent workers.

1. Connect your repository.
2. The provider should detect the `Dockerfile`.
3. Add your Environment Variables.
4. Deploy.
