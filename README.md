# Samsung Galaxy Cinematic Showcase

A high-end, interactive e-commerce storefront for the Samsung Galaxy S26 Series featuring an immersive 3D customizer, React Router commerce workflow, Redux State management, and Node/Express backend with Stripe test payment flow.

## Project Structure

```
Samsung-project/
├── client/              # React + Vite frontend application
│   ├── src/
│   │   ├── pages/       # Cinematic, Store, Checkout & Success screens
│   │   ├── components/  # Cart Drawer, Chat widget, and layouts
│   │   ├── store/       # Redux Toolkit State management
│   │   ├── three/       # React Three Fiber 3D Scenes & custom hooks
│   │   └── services/    # Client-side API fetchers
│   └── package.json
└── server/              # Express backend application
    ├── config/          # MongoDB / Stripe configuration handlers
    ├── models/          # Product, Order, and User Mongoose definitions
    ├── routes/          # API express router handlers
    ├── controllers/     # API request endpoints
    └── server.js        # Main server setup & database seed
```

## Getting Started

### Prerequisites
- Node.js installed (v18+ recommended)
- MongoDB running locally (or MongoDB Atlas URI)

### Setup & Installation

1. Clone or extract the project to your local directory.
2. Install client dependencies:
   ```bash
   cd client
   npm install
   ```
3. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

### Running the Project

#### 1. Start MongoDB
Ensure MongoDB is running on your machine (default port: `27017`).

#### 2. Start Backend API Server
Navigate to the server directory and start the dev server:
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5000` and automatically seed default products if your database is empty.

#### 3. Start Frontend Client Server
Navigate to the client directory and start the Vite dev server:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:3000` and proxy backend requests to the server automatically.
