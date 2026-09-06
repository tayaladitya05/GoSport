# GoSport

GoSport is a full-stack sports management project for **cricket** and **football**.
It supports three user roles:

- **Admin**: create matches, update scores, manage squads, apply AI squad selection
- **Player**: login and mark match availability
- **Spectator**: view live score updates and player skill summaries

## Tech Stack

### Backend (`gosport-backend`)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.io (real-time score updates)

### Frontend (`gosport-frontend`)
- React
- React Router
- Axios
- Socket.io client

## Project Structure

```text
GoSport/
  gosport-backend/
  gosport-frontend/
```

## Key Features

- Cricket and football match creation
- Team score tracking (`MatchScore`)
  - Cricket: runs, wickets, overs
  - Football: goals
- Player-wise match scorecards
- Live updates via Socket.io (`scoreUpdate` event)
- Public player skill API
- AI squad ranking for admins

## Backend Setup

1. Go to backend folder:
   ```bash
   cd gosport-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create env file:
   ```bash
   copy .env.example .env
   ```
   (Use `cp .env.example .env` on macOS/Linux)
4. Start server:
   ```bash
   npm start
   ```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Open a new terminal:
   ```bash
   cd gosport-frontend
   npm install
   npm start
   ```

Frontend runs on `http://localhost:3000`.

## Environment Variables (`gosport-backend/.env`)

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
MONGODB_URI=mongodb://127.0.0.1:27017/gosport
PORT=5000
```

## Main API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Public
- `GET /api/public/players/:playerId/skills`

### Matches
- `POST /api/matches` (admin)
- `GET /api/matches`
- `GET /api/matches/:matchId/players`
- `GET /api/matches/:matchId/scorecard`
- `POST /api/matches/:matchId/add-player` (admin)
- `PUT /api/matches/:matchId/status` (admin)
- `POST /api/matches/:matchId/availability` (player)
- `PUT /api/matches/matchplayer/:matchPlayerId` (admin)

### AI Squad
- `POST /api/matches/:matchId/ai-squad/cricket` (admin)
  - Body example: `{ "maxSlots": 11, "teamName": "CSE" }`
- `POST /api/matches/:matchId/ai-squad/football` (admin)
  - Body example: `{ "maxSlots": 11, "teamName": "CSE" }`
- `PUT /api/matches/:matchId/ai-squad-apply` (admin)

### Stats
- `POST /api/stats/cricket` (admin)
- `PUT /api/stats/cricket/update` (admin)
- `POST /api/stats/football` (admin)
- `PUT /api/stats/football/update` (admin)

## Real-Time Testing

Open:

- `http://localhost:5000/test-socket.html`

Then trigger cricket/football score update API requests.  
You should receive live `scoreUpdate` events in the browser.

## Notes

- Use **Player `_id`** from `players` collection when updating player stats.
- Role-based APIs require `Authorization: Bearer <token>`.
- AI squad ranking is heuristic-based (transparent formulas in `gosport-backend/utils/aiSquad.js`).

