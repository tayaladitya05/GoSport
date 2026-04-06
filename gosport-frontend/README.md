# GoSport Frontend

React frontend for the GoSport sports management platform.

## Tech Stack
- React 18 + React Router v6
- Axios (API calls)
- Socket.io-client (live score updates)
- Google Fonts: Bebas Neue + DM Sans

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
The `.env` file is already set to point to your local backend:
```
REACT_APP_API_URL=http://localhost:5000/api
```
Change this if your backend runs on a different port or is deployed.

### 3. Start the backend first
```bash
cd ../backend
npm install
npm start
# Backend runs on http://localhost:5000
```

### 4. Start the frontend
```bash
npm start
# Frontend runs on http://localhost:3000
```

---

## Features by Role

### 🔴 Admin
- Dashboard with match stats
- Create matches (cricket / football)
- Manage players
- View scorecards per match
- AI squad suggestions (powered by backend heuristics)

### 🟢 Player
- Dashboard
- View all matches & scorecards
- Mark availability (via match detail)
- View career stats

### 🔵 Spectator
- View all matches
- Live score updates via Socket.io (real-time)
- Public player skill profiles

---

## Project Structure
```
src/
├── context/
│   └── AuthContext.js      # Global auth state, login/logout/register
├── utils/
│   └── api.js              # Axios instance with auth headers
├── components/
│   ├── Navbar.js           # Top nav, role-aware links
│   ├── ProtectedRoute.js   # Route guard by role
│   └── Toast.js            # Global toast notifications
├── pages/
│   ├── Login.js
│   ├── Register.js         # Role selector + player profile fields
│   ├── Dashboard.js        # Role-aware landing page
│   ├── Matches.js          # Match list with status filters
│   ├── MatchDetail.js      # Scorecard + live scores + AI squad
│   ├── CreateMatch.js      # Admin: create match form
│   ├── Players.js          # Player list (admin/player)
│   ├── PlayerStats.js      # Career stats for a player
│   └── MyStats.js          # Player's own stats view
└── index.css               # Global theme (GoSport dark green + orange)
```

---

## Backend API Endpoints Used

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | None |
| POST | /api/auth/login | None |
| GET | /api/matches | None |
| POST | /api/matches | Admin |
| GET | /api/matches/:id/players | Auth |
| GET | /api/matches/:id/scorecard | Auth |
| POST | /api/matches/:id/ai-squad/:sport | Admin |
| GET | /api/players | Auth |
| GET | /api/players/:id/stats | Auth |
| GET | /api/public/players/:id/skills | None |

## Socket.io
The app connects to `http://localhost:5000` (or your backend URL without `/api`) and listens for `scoreUpdate` events on live matches.
