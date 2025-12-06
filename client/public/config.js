// public/config.js

// Detect if we are in production (deployed on Vercel) or local
const isProduction = window.location.hostname !== "localhost";

window.appConfig = {
    API_URL: isProduction
        ? "https://backend-3jwwdw9og-anandadarshans-projects.vercel.app"
        : "http://localhost:5000" // your local backend
};
