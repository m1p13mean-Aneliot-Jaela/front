# Vercel Deployment Guide

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Git repository connected to your project

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `front` directory as the root directory
4. Vercel will auto-detect the Angular framework
5. Click "Deploy"

### 3. Deploy via CLI
```bash
cd front
vercel
```

## Environment Variables

Configure the following environment variables in Vercel Dashboard (Settings → Environment Variables):

### Production Environment Variable
- **Key**: `API_URL`
- **Value**: Your backend API URL (e.g., `https://your-api.com/api`)

The Angular build will use the production environment configuration which expects the API at the path specified in `environment.prod.ts`.

## Build Configuration

The project uses the following build settings (configured in `vercel.json`):
- **Build Command**: `npm run build`
- **Output Directory**: `dist/m1p13mean-frontend/browser`
- **Install Command**: `npm install`
- **Development Command**: `npm start`

## Routing

The `vercel.json` configuration includes rewrites to handle Angular's client-side routing. All routes will be redirected to `index.html` to allow Angular Router to handle navigation.

## After Deployment

1. Your application will be available at: `https://your-project.vercel.app`
2. Set up a custom domain in Vercel Dashboard → Settings → Domains (optional)
3. Configure environment variables as needed
4. Enable automatic deployments for your Git branch

## Updating the API URL

If you need to update the backend API URL after deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the `API_URL` variable
3. Redeploy the application

Alternatively, update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-api.com/api'
};
```

## Troubleshooting

### Build Fails
- Check the build logs in Vercel Dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility

### 404 Errors on Refresh
- This should be handled by the rewrites in `vercel.json`
- If issues persist, check that the rewrite rules are correctly configured

### API Connection Issues
- Verify the API URL in environment variables
- Check CORS configuration on your backend
- Ensure the backend is accessible from Vercel's servers
