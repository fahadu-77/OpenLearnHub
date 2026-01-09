---
description: how to deploy the application
---

# Deployment Workflow

## Prerequisites
1. MongoDB Atlas account (or local MongoDB)
2. Node.js installed (v18+)
3. Domain/hosting (optional)

## Backend Deployment

### 1. Prepare Environment Variables
Create `.env` file in `server/` directory:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
```

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Start Backend Server
// turbo
```bash
npm start
```

Server will run on `http://localhost:3000`

## Frontend Deployment

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
// turbo
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Build for Production (Optional)
```bash
npm run build
```

## Production Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)
- **Frontend**: Deploy `client/` folder to Vercel
- **Backend**: Deploy `server/` folder to Railway
- Update API base URL in `client/src/utils/api.js`

### Option 2: Single Server (VPS)
- Use PM2 to run both servers
- Configure Nginx as reverse proxy
- Set up SSL with Let's Encrypt

### Option 3: Heroku
- Deploy backend to Heroku
- Deploy frontend to Vercel/Netlify
- Add MongoDB Atlas connection string

## Post-Deployment Checklist
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test course creation
- [ ] Test course enrollment
- [ ] Test category navigation
- [ ] Verify file uploads work
- [ ] Check database connections
