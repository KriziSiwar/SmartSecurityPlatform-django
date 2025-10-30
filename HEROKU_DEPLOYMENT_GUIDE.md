# Heroku Deployment Guide for Smart Security Platform

This comprehensive guide covers deploying both the Django backend and React frontend of the Smart Security Platform to Heroku.

## Prerequisites

- Heroku account
- Heroku CLI installed
- Git repository initialized
- Node.js and npm installed (for frontend)
- Python 3.11.6 installed (for backend)

## Table of Contents

1. [Heroku CLI Setup](#heroku-cli-setup)
2. [Backend Deployment (Django)](#backend-deployment-django)
3. [Frontend Deployment (React)](#frontend-deployment-react)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Static Files Handling](#static-files-handling)
7. [Troubleshooting](#troubleshooting)

## Heroku CLI Setup

### 1. Install Heroku CLI

**Windows:**
```bash
# Download and install from: https://devcenter.heroku.com/articles/heroku-cli
```

**macOS (using Homebrew):**
```bash
brew tap heroku/brew && brew install heroku
```

**Ubuntu/Debian:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login to Heroku

```bash
heroku login
```

### 3. Verify Installation

```bash
heroku --version
```

## Backend Deployment (Django)

### 1. Prepare Your Django Application

Ensure you have the following files in your project root:

- `Procfile` (already configured)
- `runtime.txt` (already configured)
- `requirements.txt` (already configured)
- `.env` file (for local development)

### 2. Create Heroku App

```bash
# Create a new Heroku app
heroku create your-app-name-backend

# Or create with specific region
heroku create your-app-name-backend --region eu
```

### 3. Configure Buildpacks

```bash
# Add Python buildpack
heroku buildpacks:add heroku/python --app your-app-name-backend
```

### 4. Set Environment Variables

```bash
# Set Django settings
heroku config:set DEBUG=False --app your-app-name-backend
heroku config:set SECRET_KEY=your-super-secret-key-here --app your-app-name-backend
heroku config:set ALLOWED_HOSTS=your-app-name-backend.herokuapp.com --app your-app-name-backend

# Set database URL (will be set automatically when adding Heroku Postgres)
```

### 5. Deploy Backend

```bash
# Add all files to git
git add .

# Commit changes
git commit -m "Prepare for Heroku deployment"

# Push to Heroku
git push heroku main
```

### 6. Run Database Migrations

```bash
# Run migrations on Heroku
heroku run python manage.py migrate --app your-app-name-backend

# Create superuser (optional)
heroku run python manage.py createsuperuser --app your-app-name-backend
```

### 7. Verify Deployment

```bash
# Open the app in browser
heroku open --app your-app-name-backend

# Check logs
heroku logs --tail --app your-app-name-backend
```

## Frontend Deployment (React)

### 1. Prepare Your React Application

Update your `frontend/.env.production` file with the correct backend URL:

```env
VITE_API_BASE_URL=https://your-app-name-backend.herokuapp.com
```

### 2. Build the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 3. Create Heroku App for Frontend

```bash
# From project root
heroku create your-app-name-frontend --buildpack mars/create-react-app
```

### 4. Configure Frontend Buildpack

```bash
# Set Node.js buildpack
heroku buildpacks:set heroku/nodejs --app your-app-name-frontend
```

### 5. Set Environment Variables for Frontend

```bash
# Set production API URL
heroku config:set VITE_API_BASE_URL=https://your-app-name-backend.herokuapp.com --app your-app-name-frontend
```

### 6. Deploy Frontend

```bash
# From project root
git add .
git commit -m "Deploy frontend to Heroku"
git push heroku main
```

### 7. Verify Frontend Deployment

```bash
heroku open --app your-app-name-frontend
```

## Database Configuration

### 1. Add Heroku Postgres

```bash
# Add PostgreSQL database to backend app
heroku addons:create heroku-postgresql:hobby-dev --app your-app-name-backend
```

### 2. Check Database Connection

```bash
# View database URL
heroku config --app your-app-name-backend | grep DATABASE_URL
```

The `DATABASE_URL` environment variable is automatically set by Heroku and used by `dj-database-url` in your Django settings.

### 3. Database Migrations

```bash
# Run migrations
heroku run python manage.py migrate --app your-app-name-backend
```

## Environment Variables

### Backend Environment Variables

Set these in your Heroku backend app:

```bash
heroku config:set DEBUG=False --app your-app-name-backend
heroku config:set SECRET_KEY=your-super-secret-key-here --app your-app-name-backend
heroku config:set ALLOWED_HOSTS=your-app-name-backend.herokuapp.com --app your-app-name-backend
heroku config:set DJANGO_SETTINGS_MODULE=SmartSecurityPlatform.settings --app your-app-name-backend
```

### Frontend Environment Variables

Set these in your Heroku frontend app:

```bash
heroku config:set VITE_API_BASE_URL=https://your-app-name-backend.herokuapp.com --app your-app-name-frontend
```

### Viewing Environment Variables

```bash
# View all config vars for backend
heroku config --app your-app-name-backend

# View all config vars for frontend
heroku config --app your-app-name-frontend
```

## Static Files Handling

Your Django application is already configured to serve static files using WhiteNoise:

- `whitenoise` is included in `requirements.txt`
- `WhiteNoiseMiddleware` is configured in `MIDDLEWARE`
- `STATICFILES_STORAGE` is set to `whitenoise.storage.CompressedManifestStaticFilesStorage`

### Collecting Static Files

```bash
# Collect static files on Heroku
heroku run python manage.py collectstatic --noinput --app your-app-name-backend
```

## Troubleshooting

### Common Issues

#### 1. Application Error (H10)

**Symptoms:** App crashes immediately
**Solutions:**
- Check logs: `heroku logs --tail --app your-app-name`
- Verify Procfile syntax
- Ensure all dependencies are in requirements.txt
- Check Python version in runtime.txt

#### 2. Database Connection Issues

**Symptoms:** Database errors in logs
**Solutions:**
- Verify DATABASE_URL is set: `heroku config --app your-app-name | grep DATABASE_URL`
- Run migrations: `heroku run python manage.py migrate --app your-app-name`
- Check database addon: `heroku addons --app your-app-name`

#### 3. Static Files Not Loading

**Symptoms:** CSS/JS files return 404
**Solutions:**
- Run collectstatic: `heroku run python manage.py collectstatic --noinput --app your-app-name`
- Verify WhiteNoise configuration in settings.py
- Check STATIC_URL and STATIC_ROOT settings

#### 4. CORS Issues

**Symptoms:** Frontend can't connect to backend API
**Solutions:**
- Verify CORS settings in Django settings.py
- Check ALLOWED_HOSTS includes Heroku domain
- Ensure frontend VITE_API_BASE_URL is correct

#### 5. Build Failures

**Symptoms:** Build fails during deployment
**Solutions:**
- Check build logs: `heroku logs --app your-app-name --source heroku`
- Verify requirements.txt includes all dependencies
- Check Python version compatibility
- Ensure no local paths in requirements

#### 6. Memory Issues

**Symptoms:** App runs out of memory
**Solutions:**
- Upgrade dyno type: `heroku dyno:type hobby --app your-app-name`
- Optimize memory usage in code
- Use background jobs for heavy processing

#### 7. Timeout Issues

**Symptoms:** H12 errors (request timeout)
**Solutions:**
- Optimize database queries
- Use pagination for large datasets
- Implement caching
- Consider using background workers

### Useful Commands

```bash
# View recent logs
heroku logs --app your-app-name

# View real-time logs
heroku logs --tail --app your-app-name

# Restart app
heroku restart --app your-app-name

# Scale dynos
heroku ps:scale web=1 --app your-app-name

# View app info
heroku info --app your-app-name

# View config
heroku config --app your-app-name

# Run Django shell
heroku run python manage.py shell --app your-app-name

# Database shell
heroku pg:psql --app your-app-name
```

### Performance Optimization

1. **Enable Gzip compression** (handled by WhiteNoise)
2. **Use CDN for static files** (optional)
3. **Implement caching** with Redis/Memcached
4. **Optimize database queries**
5. **Use connection pooling**

### Security Considerations

1. **Set DEBUG=False** in production
2. **Use strong SECRET_KEY**
3. **Configure ALLOWED_HOSTS** properly
4. **Enable HTTPS** (automatic on Heroku)
5. **Use environment variables** for sensitive data
6. **Regular security updates**

### Monitoring

```bash
# View app metrics
heroku metrics --app your-app-name

# View dyno status
heroku ps --app your-app-name

# View addons
heroku addons --app your-app-name
```

## Deployment Checklist

- [ ] Heroku CLI installed and logged in
- [ ] Backend app created
- [ ] Frontend app created
- [ ] Environment variables configured
- [ ] Database addon added
- [ ] Static files collected
- [ ] Migrations run
- [ ] Apps deployed successfully
- [ ] CORS configured correctly
- [ ] Frontend API URL updated
- [ ] Apps accessible via browser

## Cost Optimization

- **Free Tier:** 550-1000 dyno hours/month
- **Hobby Dev:** $7/month for database
- **Monitor usage:** `heroku ps --app your-app-name`
- **Scale down when not in use**

For more information, visit the [Heroku Dev Center](https://devcenter.heroku.com/).