# Vercel Deployment Guide

## Environment Variables Setup

Your app requires the following environment variable to be set in Vercel:

### Required Environment Variable

**`VITE_CONVEX_URL`** - Your Convex deployment URL

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`q-ashooka`)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `VITE_CONVEX_URL`
   - **Value**: `https://dashing-toucan-455.convex.cloud`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for the changes to take effect

### Current Convex Deployment

- **Deployment Name**: `dashing-toucan-455`
- **Dashboard**: https://dashboard.convex.dev/d/dashing-toucan-455
- **Development URL**: `https://dashing-toucan-455.convex.cloud`

### For Production

If you have a production Convex deployment, use that URL instead. You can find it in your Convex dashboard under your production deployment settings.

### After Setting Environment Variables

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on your latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete
5. Your app should now work correctly!

### Troubleshooting

If you still see the error "No address provided to ConvexReactClient":
- Verify the environment variable is set correctly in Vercel
- Make sure you redeployed after adding the variable
- Check that the variable name is exactly `VITE_CONVEX_URL` (case-sensitive)
- Verify the Convex URL is accessible and correct

