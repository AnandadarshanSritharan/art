# Art Sale Platform

A comprehensive online platform for artists to sell their artworks. Built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure login and registration with JWT.
- **Browse Artworks**: View a gallery of artworks with filtering and search.
- **Shopping Cart**: Add items to cart and proceed to checkout.
- **Stripe Payments**: Secure payment processing.
- **Admin Dashboard**: Manage artworks, orders, and users.
- **Responsive Design**: Optimized for mobile and desktop.
- **Animations**: Smooth transitions using Framer Motion.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Zustand, Vite.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Stripe.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)
- Stripe Account (for payments)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd art-sale-platform
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

1.  **Backend Environment Variables:**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/art-platform
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

2.  **Frontend Environment Variables:**
    (Optional) Create a `.env` file in the `client` directory if needed for API URL customization.

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Frontend:**
    ```bash
    cd client
    npm run dev
    ```

3.  Open your browser and navigate to `http://localhost:5173`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT
