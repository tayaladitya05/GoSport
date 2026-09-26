# GoSport

GoSport is a full-stack web application designed for organizing, managing, and tracking sports matches (Cricket & Football) with live real-time score updates and role-based access.

---

## Features

- **Multi-Sport Management**: Full support for both Cricket (runs, wickets, overs, player scorecards) and Football (goals, assists, cards, match stats).
- **Role-Based Access Control**:
  - **Admin**: Create and schedule matches, manage squads, update live scores, and generate algorithmic squad recommendations.
  - **Player**: View fixtures, track personal performance and career stats, and submit match availability.
  - **Spectator**: View live scoreboards, match summaries, and public player profiles without authentication.
- **Real-Time Live Scores**: Live score broadcasting powered by Socket.io so spectators see instant updates without refreshing.
- **Squad Recommendation**: Automated squad ranking based on player performance metrics and career history.

---

## Tech Stack

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Real-Time Engine**: Socket.io

### Frontend
- **Framework**: React 18 (React Router v6)
- **HTTP Client**: Axios
- **Real-Time Client**: Socket.io Client

---

## Repository Structure

```text
GoSport/
├── gosport-backend/
│   ├── controllers/      # Route logic & controllers
│   ├── middleware/       # Auth and validation middleware
│   ├── models/           # Mongoose schemas (User, Match, Stats, etc.)
│   ├── routes/           # Express API route declarations
│   ├── utils/            # Helper utilities and squad ranking logic
│   ├── server.js         # Backend entry point
│   └── package.json
└── gosport-frontend/
    ├── public/
    ├── src/
    │   ├── components/   # Reusable UI components (Navbar, ProtectedRoute, Toast)
    │   ├── context/      # AuthContext for global session state
    │   ├── pages/        # Views (Dashboard, Matches, MatchDetail, Stats, etc.)
    │   └── utils/        # Axios API client configuration
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas URI

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd gosport-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in `gosport-backend/` (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Configure the following variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/gosport
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will be running on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd gosport-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in `gosport-frontend/`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   The frontend will open on `http://localhost:3000`.

---

## API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (Player / Admin / Spectator)
- `POST /api/auth/login` - Authenticate and return JWT

### Matches (`/api/matches`)
- `GET /api/matches` - Get list of matches (filterable by sport/status)
- `POST /api/matches` - Create a new match (Admin)
- `GET /api/matches/:id/scorecard` - Fetch scorecard details for a match
- `POST /api/matches/:id/availability` - Submit player availability (Player)
- `POST /api/matches/:id/ai-squad/:sport` - Get algorithmic squad recommendations (Admin)

### Stats & Performance (`/api/stats` & `/api/players`)
- `PUT /api/stats/cricket/update` - Update cricket match statistics (Admin)
- `PUT /api/stats/football/update` - Update football match statistics (Admin)
- `GET /api/players/:id/stats` - Fetch player career performance
- `GET /api/public/players/:id/skills` - Public summary of player skills
