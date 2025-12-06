# Deployment Guide

This guide outlines the steps to deploy the Art Sale Platform to production.

## Backend Deployment (e.g., Render, Heroku, Railway)

1.  **Prepare the Code:**
    - Ensure `package.json` has a `start` script: `"start": "node server.js"`.
    - Ensure your MongoDB connection string is configurable via environment variables (`MONGO_URI`).

2.  **Create a Service:**
    - Connect your repository to your hosting provider.
    - Set the **Root Directory** to `server`.
    - Set the **Build Command** to `npm install`.
    - Set the **Start Command** to `npm start`.

3.  **Environment Variables:**
    - Add the following environment variables in your hosting dashboard:
        - `NODE_ENV`: `production`
        - `MONGO_URI`: Your production MongoDB connection string (e.g., MongoDB Atlas).
        - `JWT_SECRET`: A strong, unique secret key.
        - `STRIPE_SECRET_KEY`: Your Stripe live secret key.

## Frontend Deployment (e.g., Vercel, Netlify)

1.  **Prepare the Code:**
    - Ensure `vite.config.ts` is configured correctly.
    - Update the API base URL in `client/src/api/axios.ts` to point to your deployed backend URL instead of `http://localhost:5000/api`. You can use an environment variable like `import.meta.env.VITE_API_URL`.

2.  **Create a Project:**
    - Connect your repository to Vercel or Netlify.
    - Set the **Root Directory** to `client`.
    - The **Build Command** should be `npm run build` (or `tsc && vite build`).
    - The **Output Directory** should be `dist`.

3.  **Environment Variables:**
    - Add `VITE_API_URL` pointing to your production backend URL (e.g., `https://your-backend-app.onrender.com/api`).

## Post-Deployment Checks

1.  **Database Connection:** Verify the backend connects to the production database.
2.  **API Connectivity:** Ensure the frontend can successfully make requests to the backend.
3.  **Stripe Integration:** Test payments using Stripe test cards in the production environment (if using test keys) or real cards (if live).
4.  **Admin Access:** Create an initial admin user directly in the database or via a registration seed script, then log in to verify admin dashboard access.
