# Vercel Deployment Setup

## Environment Variables Required

You need to set the following environment variable in your Vercel project:

### `VITE_CONVEX_URL`

**Value:** Your Convex deployment URL

- **For production:** Use your production Convex deployment URL (e.g., `https://your-deployment.convex.cloud`)
- **For preview deployments:** You can use the same production URL or create separate deployments

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`q-ashooka`)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name:** `VITE_CONVEX_URL`
   - **Value:** `https://dashing-toucan-455.convex.cloud` (or your production Convex URL)
   - **Environment:** Select all environments (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for the changes to take effect

## Getting Your Convex Production URL

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your deployment (`dashing-toucan-455`)
3. Go to **Settings** → **Deployment URL**
4. Copy the URL (should look like `https://dashing-toucan-455.convex.cloud`)

## After Setting Environment Variables

After setting the environment variable, you need to redeploy:

1. Go to your Vercel project dashboard
2. Click on the **Deployments** tab
3. Click the **⋯** menu on the latest deployment
4. Select **Redeploy**

Or push a new commit to trigger a new deployment.

## Troubleshooting

If you still see "No address provided to ConvexReactClient":
1. Verify the environment variable is set correctly in Vercel
2. Make sure you've redeployed after setting the variable
3. Check that the variable name is exactly `VITE_CONVEX_URL` (case-sensitive)
4. Verify your Convex deployment is active and accessible

