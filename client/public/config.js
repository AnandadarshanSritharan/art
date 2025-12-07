// public/config.js

// Detect if we are in production (deployed on Vercel) or local
const isProduction = window.location.hostname !== "localhost";

window.appConfig = {
    API_URL: isProduction
        ? "https://api.ceycanvas.com" // NEW backend URL
        : "http://localhost:5000" // local backend
};
