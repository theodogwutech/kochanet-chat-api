# Heroku Deployment Guide

## Fixes Applied

### 1. Created Procfile
- Tells Heroku to run `npm run start:prod` to start the application
- Located at: `/Procfile`

### 2. Added Node.js Engine Specification
- Specified Node.js 20.x and npm 10.x in `package.json`
- Ensures Heroku uses the correct Node.js version

### 3. Added heroku-postbuild Script
- Automatically builds TypeScript code after dependencies are installed
- Runs `npm run build` to compile TypeScript to JavaScript

### 4. Moved Build Dependencies
- Moved essential build packages from `devDependencies` to `dependencies`:
  - `@nestjs/cli` - needed for `nest build` command
  - `typescript` - TypeScript compiler
  - `ts-node` - TypeScript execution
  - `tsconfig-paths` - path mapping support

## Required Environment Variables

You **MUST** set these environment variables on Heroku:

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.herokuapp.com/auth/google/callback

# Email Configuration (if using)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# AI Configuration (optional)
AI_ASSISTANT_NAME=AI
AI_MODEL=gpt-4-turbo-preview
AI_MAX_CONTEXT_MESSAGES=20

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

## Setting Environment Variables on Heroku

### Option 1: Using Heroku Dashboard
1. Go to your app dashboard on Heroku
2. Navigate to **Settings** tab
3. Click **Reveal Config Vars**
4. Add each environment variable one by one

### Option 2: Using Heroku CLI
```bash
# Set variables one by one
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set OPENAI_API_KEY="your_openai_key"
# ... etc

# Or set multiple at once
heroku config:set \
  MONGODB_URI="your_mongodb_uri" \
  JWT_SECRET="your_jwt_secret" \
  OPENAI_API_KEY="your_openai_key"
```

## Deployment Steps

### First-Time Deployment

1. **Login to Heroku CLI:**
   ```bash
   heroku login
   ```

2. **Create Heroku app (if not already created):**
   ```bash
   heroku create your-app-name
   ```

3. **Add MongoDB addon (optional - or use MongoDB Atlas):**
   ```bash
   # Using MongoDB Atlas (recommended - free tier available)
   # Just set MONGODB_URI config var to your Atlas connection string

   # OR use Heroku addon (paid)
   heroku addons:create mongolab:sandbox
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   # ... set all required variables
   ```

5. **Push to Heroku:**
   ```bash
   git add .
   git commit -m "Configure for Heroku deployment"
   git push heroku main
   # or if your branch is called master:
   # git push heroku master
   ```

6. **Open your app:**
   ```bash
   heroku open
   ```

### Subsequent Deployments

```bash
git add .
git commit -m "Your commit message"
git push heroku main
```

## Checking Deployment Status

### View logs:
```bash
heroku logs --tail
```

### Check app status:
```bash
heroku ps
```

### Run commands on Heroku:
```bash
heroku run bash
```

## Common Issues & Solutions

### 1. Application Error / Crash on Startup
**Check logs:**
```bash
heroku logs --tail
```

**Common causes:**
- Missing environment variables (especially `MONGODB_URI`, `JWT_SECRET`)
- MongoDB connection failure
- Port binding issues (should use `process.env.PORT`)

### 2. Build Fails
**Check build logs:**
```bash
heroku logs --tail
```

**Common causes:**
- TypeScript compilation errors
- Missing dependencies
- Node version mismatch

### 3. WebSocket Connection Issues
Heroku supports WebSockets, but make sure:
- Your frontend connects using `wss://` (not `ws://`)
- Use the Heroku app URL, not `localhost`

### 4. Database Connection Issues
- Ensure `MONGODB_URI` is set correctly
- If using MongoDB Atlas, whitelist Heroku's IP (or allow from anywhere: `0.0.0.0/0`)
- Check MongoDB Atlas connection string format

### 5. Request Timeout
- Heroku has a 30-second request timeout
- Long-running requests (like audio transcription) might timeout
- Consider using background workers for long tasks

## MongoDB Atlas Setup (Recommended)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string
6. Set as Heroku config var:
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
   ```

## Useful Heroku Commands

```bash
# View config vars
heroku config

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1

# Open app in browser
heroku open

# View app info
heroku info

# Access Heroku bash
heroku run bash
```

## Testing Your Deployment

1. **API Health Check:**
   ```bash
   curl https://your-app.herokuapp.com/
   ```

2. **Swagger Docs:**
   Visit: `https://your-app.herokuapp.com/api/docs`

3. **WebSocket Connection:**
   Test your frontend connection to `wss://your-app.herokuapp.com`

## Additional Notes

- Heroku free tier dynos sleep after 30 minutes of inactivity
- First request after sleep takes 10-30 seconds to wake up
- Consider upgrading to Hobby tier ($7/month) for always-on dynos
- Heroku uses ephemeral filesystem - don't store uploaded files locally
  - Use cloud storage (AWS S3, Cloudinary, etc.) for file uploads
