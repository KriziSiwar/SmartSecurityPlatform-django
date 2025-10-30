# Render Deployment Guide for Smart Security Platform

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Render Account Setup](#render-account-setup)
4. [Database Configuration](#database-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Environment Variables](#environment-variables)
8. [Static Files Configuration](#static-files-configuration)
9. [Build and Start Commands](#build-and-start-commands)
10. [Troubleshooting](#troubleshooting)

## Introduction

This guide provides comprehensive instructions for deploying the Smart Security Platform (Django backend + React frontend) to Render. The platform includes AI-powered security monitoring, camera surveillance, and alert management features.

### Architecture Overview
- **Backend**: Django REST API with PostgreSQL database
- **Frontend**: React application built with Vite
- **Database**: PostgreSQL (managed by Render)
- **Static Files**: Served via WhiteNoise middleware

## Prerequisites

Before deploying to Render, ensure you have:

1. **Git Repository**: Your code pushed to GitHub, GitLab, or Bitbucket
2. **Render Account**: Free account at [render.com](https://render.com)
3. **Project Dependencies**:
   - Python 3.11.6 (as specified in `runtime.txt`)
   - Node.js (for frontend build)
   - PostgreSQL database

4. **Required Files**:
   - `requirements.txt` (Python dependencies)
   - `runtime.txt` (Python version)
   - `Procfile` (web server configuration)
   - `frontend/package.json` (Node.js dependencies)

## Render Account Setup

### 1. Create Render Account
1. Visit [render.com](https://render.com) and sign up for a free account
2. Verify your email address
3. Complete your profile setup

### 2. Connect Repository
1. In your Render dashboard, click "New +" → "Web Service"
2. Connect your Git repository (GitHub/GitLab/Bitbucket)
3. Select the repository containing your Smart Security Platform code

### 3. Service Configuration
When creating a new web service, you'll need to configure:
- **Service Name**: Choose a unique name (e.g., `smart-security-backend`)
- **Environment**: Python 3
- **Build Command**: Custom build command
- **Start Command**: Custom start command

## Database Configuration

### 1. Create PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure the database:
   - **Name**: `smart-security-db` (or similar)
   - **Database**: Leave default or specify
   - **User**: Leave default or specify
   - **Region**: Choose closest to your users
   - **Plan**: Free tier for development

3. Note the connection details (automatically generated):
   - **Host**: `your-db-host.render.com`
   - **Port**: `5432`
   - **Database Name**: As configured
   - **Username**: As configured
   - **Password**: Auto-generated (copy it!)

### 2. Database URL Format
Render provides a `DATABASE_URL` environment variable in this format:
```
postgresql://username:password@host:port/database
```

This is automatically handled by `dj-database-url` in your Django settings.

## Backend Deployment

### Step-by-Step Backend Deployment

1. **Create Web Service**
   - Service Type: Web Service
   - Runtime: Python 3
   - Build Command: `./build.sh` (we'll create this)
   - Start Command: `gunicorn SmartSecurityPlatform.wsgi --log-file -`

2. **Environment Variables** (see Environment Variables section)

3. **Deploy**
   - Render will automatically build and deploy when you push to your repository
   - Monitor the build logs for any errors

### Build Script
Create a `build.sh` file in your root directory:

```bash
#!/bin/bash
# Install Python dependencies
pip install -r requirements.txt

# Run Django migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
```

Make sure `build.sh` is executable:
```bash
chmod +x build.sh
```

## Frontend Deployment

### Option 1: Static Site on Render

1. **Create Static Site Service**
   - Service Type: Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Environment Variables**
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com/api`)

3. **Custom Domain** (Optional)
   - Configure custom domain in Render dashboard
   - Update CORS settings in Django if needed

### Option 2: Serve Frontend from Backend

If you prefer to serve the frontend from your Django backend:

1. **Modify Django Settings**
   Add frontend build directory to static files:

```python
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'SmartSecurityPlatform', 'static'),
    os.path.join(BASE_DIR, 'frontend', 'dist'),  # Add this line
]
```

2. **Update Build Script**
Modify `build.sh` to build the frontend:

```bash
#!/bin/bash
# Install Python dependencies
pip install -r requirements.txt

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Run Django migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
```

## Environment Variables

### Backend Environment Variables

Set these in your Render web service environment variables:

```
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-app.onrender.com,localhost,127.0.0.1
DATABASE_URL=postgresql://user:pass@host:port/db  # Provided by Render DB
DJANGO_SETTINGS_MODULE=SmartSecurityPlatform.settings
```

### Frontend Environment Variables

For static site deployment:

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

### Setting Environment Variables in Render

1. Go to your service dashboard
2. Navigate to Environment
3. Add each variable with its value
4. Redeploy the service

## Static Files Configuration

### Django Static Files Setup

Your Django settings already include WhiteNoise configuration:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Already configured
    # ... other middleware
]

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Static Files in Production

1. **Collect Static Files**: Run during build
2. **WhiteNoise**: Serves static files efficiently
3. **CDN**: Consider using Render's CDN for better performance

## Build and Start Commands

### Backend Build Command
```
./build.sh
```

### Backend Start Command
```
gunicorn SmartSecurityPlatform.wsgi --log-file -
```

### Frontend Build Command (Static Site)
```
cd frontend && npm install && npm run build
```

### Frontend Publish Directory
```
frontend/dist
```

## Troubleshooting

### Common Backend Issues

#### 1. Build Failures
**Issue**: `ModuleNotFoundError` during build
**Solution**:
- Ensure all dependencies are in `requirements.txt`
- Check Python version compatibility
- Verify `runtime.txt` specifies correct Python version

#### 2. Database Connection Issues
**Issue**: `django.db.utils.OperationalError`
**Solution**:
- Verify `DATABASE_URL` environment variable
- Check database credentials
- Ensure database is running and accessible

#### 3. Static Files Not Loading
**Issue**: 404 errors for static files
**Solution**:
- Run `python manage.py collectstatic` during build
- Verify `STATIC_ROOT` and `STATIC_URL` settings
- Check WhiteNoise middleware is enabled

#### 4. Migration Errors
**Issue**: Migration conflicts during deployment
**Solution**:
- Ensure migrations are committed to repository
- Check migration files are not corrupted
- Run `python manage.py showmigrations` to verify status

### Common Frontend Issues

#### 1. Build Failures
**Issue**: `npm install` or `npm run build` fails
**Solution**:
- Check `frontend/package.json` dependencies
- Verify Node.js version compatibility
- Clear npm cache if needed

#### 2. API Connection Issues
**Issue**: Frontend can't connect to backend API
**Solution**:
- Verify `VITE_API_BASE_URL` environment variable
- Check CORS settings in Django
- Ensure backend is running and accessible

#### 3. Routing Issues (SPA)
**Issue**: Page refreshes result in 404
**Solution**: Configure `_redirects` file in `frontend/public/`:
```
/*    /index.html   200
```

### General Troubleshooting Steps

1. **Check Logs**: View service logs in Render dashboard
2. **Environment Variables**: Verify all required variables are set
3. **Dependencies**: Ensure all dependencies are properly installed
4. **Database**: Confirm database is accessible and migrations run
5. **Static Files**: Verify static files are collected and served
6. **CORS**: Check cross-origin settings for API access

### Performance Optimization

1. **Enable Gzip Compression**: Already handled by WhiteNoise
2. **Database Indexing**: Add indexes for frequently queried fields
3. **Caching**: Implement Redis for session/data caching
4. **CDN**: Use Render's CDN for static assets
5. **Monitoring**: Set up logging and monitoring alerts

### Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **DEBUG Mode**: Ensure `DEBUG=False` in production
3. **HTTPS**: Render provides automatic HTTPS
4. **CSRF Protection**: Configure trusted origins
5. **CORS**: Restrict origins in production

---

For additional support, refer to:
- [Render Documentation](https://docs.render.com/)
- [Django Deployment Documentation](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [React Deployment Guide](https://vitejs.dev/guide/static-deploy.html)