# GoSport – Step-by-step learning guide

This file explains what we do in each step so you can learn and follow along.

---

## Step 1: Backend foundation (DONE)

### What we did

1. **Environment variables (.env)**
   - **Why:** Secrets (JWT secret, database URL) should not be hardcoded. If you push code to GitHub, anyone could see "secretkey". We put them in a `.env` file and add `.env` to `.gitignore` so they are never committed.
   - **What:** We created `.env.example` with placeholders. You copy it to `.env` and put your real values there. The app reads from `.env` at runtime.

2. **dotenv package**
   - **Why:** Node.js does not load `.env` by itself. The `dotenv` package reads the `.env` file and sets `process.env.JWT_SECRET`, `process.env.PORT`, etc.
   - **What:** We added `require("dotenv").config()` at the top of `server.js` so that when the server starts, all variables from `.env` are available as `process.env.VARIABLE_NAME`.

3. **Using env in code**
   - **JWT_SECRET:** In `authRoutes.js` (login) and `authMiddleware.js` (protect routes) we replaced the hardcoded `"secretkey"` with `process.env.JWT_SECRET`. If `.env` is missing, we fall back to a dev default so the app still runs locally.
   - **MONGODB_URI and PORT:** In `server.js` we use `process.env.MONGODB_URI` and `process.env.PORT` so you can change database or port without editing code.

4. **package.json**
   - **main:** Changed from `index.js` to `server.js` because the real entry file is `server.js`.
   - **scripts.start:** Added `"start": "node server.js"` so you can run the backend with `npm start` from the `backend` folder.

5. **.gitignore**
   - We added `backend/.gitignore` with `node_modules/` and `.env`. That way you never accidentally commit dependencies or secrets.

### What you need to do

- In the `backend` folder, run: **`copy .env.example .env`** (Windows) or **`cp .env.example .env`** (Mac/Linux).
- Open `.env` and set `JWT_SECRET` to any long random string (e.g. `my-secret-key-12345`). Leave `MONGODB_URI` and `PORT` as is if you use local MongoDB on port 5000.
- Run **`npm install`** in `backend` (to install `dotenv`), then **`npm start`** to start the server.

---

## Step 2: MatchScore flow (DONE)

### What we did

1. **Create MatchScore when a cricket match is created**
   - **Why:** The `PUT /api/stats/cricket/update` route updates the **team total** (runs) in `MatchScore`. If no `MatchScore` document exists for that match and team, `MatchScore.findOne()` returns `null`, and doing `teamScore.runs += runs` would crash the server. So we need to create score entries when the match is created.
   - **What:** In `matchRoutes.js`, after we create the match with `Match.create()`, we check: if `sportType === "cricket"` and the match has a `teams` array, we call `MatchScore.insertMany()` with one object per team. Each has `match: match._id`, `teamName`, and `runs: 0`, `wickets: 0`, `overs: 0`. Now when the admin updates a run, the backend finds that document and updates it.

2. **Cricket and football**
   - **Why:** Cricket uses runs/wickets/overs; football uses goals. We use one `MatchScore` model for both: it has `runs`, `wickets`, `overs` (cricket) and `goals` (football). When the match is cricket we create score rows with runs/wickets/overs; when football we create score rows with `goals: 0`.

3. **Safety check in stats route**
   - **Why:** For matches created before this change, or if someone sends a wrong `teamName`, there might still be no `MatchScore`. Instead of crashing, we should return a clear error.
   - **What:** In `statsRoutes.js`, after `MatchScore.findOne()`, we added `if (!teamScore) return res.status(404).json({ message: "..." })`. So the API returns 404 with a helpful message instead of throwing.

### Flow now

**Cricket**
1. Admin creates a cricket match with `teams: ["Team A", "Team B"]`.
2. Backend creates one `Match` and two `MatchScore` docs (Team A and Team B: runs 0, wickets 0, overs 0).
3. Admin updates score via `PUT /api/stats/cricket/update` with `matchId`, `playerId`, `teamName`, `runs`. Backend updates player’s CricketStat and team’s MatchScore.

**Football**
1. Admin creates a football match with `teams: ["Team A", "Team B"]`.
2. Backend creates one `Match` and two `MatchScore` docs (Team A and Team B: goals 0).
3. Admin records a goal via `PUT /api/stats/football/update` with `matchId`, `playerId`, `teamName`. Backend updates player’s FootballStat (goals) and team’s MatchScore (goals).

**Scorecard**  
`GET /api/matches/:matchId/scorecard` returns `match`, `stats` (player stats), and `teamScores` (team totals: runs/wickets/overs for cricket, goals for football).

---

## Step 3: Real-time live scores (DONE)

### What we did

1. **Socket.io on the same server**
   - **Why:** Spectators should see score changes as soon as the admin updates them, without refreshing the page. Socket.io keeps a live connection between the server and every open browser tab. When the server “emits” an event, all connected clients receive it instantly.
   - **What:** We created an HTTP server with `http.createServer(app)` and attached Socket.io to it. The app now runs on this single server, so both REST API and WebSocket use the same port (e.g. 5000). We store the `io` instance with `app.set("io", io)` so route handlers can emit events.

2. **Emit on score update**
   - **Why:** When the admin calls `PUT /api/stats/cricket/update` or `PUT /api/stats/football/update`, we want every spectator’s screen to update.
   - **What:** In both routes, after we save the updated team score, we get `io` with `req.app.get("io")`, fetch all `MatchScore` for that match, and emit an event: `io.emit("scoreUpdate", { matchId, sportType, teamScores })`. `teamScores` is the list of team totals (runs/wickets/overs for cricket, goals for football). We use `.lean()` so we send plain JSON (no Mongoose docs).

3. **Event name and payload**
   - **Event name:** `scoreUpdate`
   - **Payload:** `{ matchId, sportType: "cricket" | "football", teamScores }`.  
   The frontend can listen for `scoreUpdate` and, if the user is watching that `matchId`, update the displayed team totals. It can also refetch `GET /api/matches/:matchId/scorecard` to refresh the full player scorecard.

### How the frontend will use it

1. Connect to the backend with the Socket.io client (same host/port as the API, e.g. `http://localhost:5000`).
2. Listen for the `scoreUpdate` event.
3. When received, if the current page is showing that `matchId`, update the UI (team scores and optionally refetch the scorecard).

---

## Step 4: Public player skills API (DONE)

### What we did

1. **New route file `routes/publicRoutes.js`**
   - **Why:** Logged-in routes live under `/api/players` with `protect`. Spectators and visitors should see a player’s career totals without signing up or sending a JWT.
   - **What:** A small router mounted at `/api/public` so URLs clearly mean “no auth required”.

2. **`GET /api/public/players/:playerId/skills`**
   - **Response:**  
     - `player`: public profile — `id`, `displayName` (from linked User’s `name`), `sportType`, `teamName`, `role`, `jerseyNumber`. No email or password.  
     - `cricket`: career aggregates — `matches`, `runs`, `ballsFaced`, `fours`, `sixes`, `wickets`, `overs`.  
     - `football`: career aggregates — `matches`, `goals`, `assists`, `yellowCards`, `redCards`, `minutesPlayed`.  
   - **404** if the `playerId` is not a valid player document.

3. **`server.js`**
   - **`app.use("/api/public", publicRoutes)`** registered before other API routes so Express loads the public routes consistently.

### How to test

- Browser or Postman: `GET http://localhost:5000/api/public/players/<PLAYER_OBJECT_ID>/skills`  
  No `Authorization` header needed.

---

## Step 5: AI squad selection (DONE)

### What we did

1. **`utils/aiSquad.js`**
   - **Why:** Keep scoring rules in one place so you can read and change them later (they are not “black box” ML).
   - **Cricket:** For each player we load **all** `CricketStat` rows (career). We aggregate runs, balls, fours, sixes, wickets, overs; then we compute a score based on `Player.role` (batsman vs bowler vs other = all‑round).  
   - **Football:** Same idea with `FootballStat` — goals/match, assists/match, minutes, card penalty.
   - **No stats yet:** If a player has zero career matches, we give a small **baseline score** so they still appear in the list (ranked lower than proven performers).

2. **Fewer than 11 players**
   - We take **`min(requestedSlots, 11, number of eligible players)`** so if you only have 6 players in the match squad, you get **6** suggestions, not a fake XI.

3. **Routes (admin only)**
   - `POST /api/matches/:matchId/ai-squad/cricket` — body optional: `{ "maxSlots": 11 }`  
   - `POST /api/matches/:matchId/ai-squad/football` — same body  
   - Only **MatchPlayer** rows for that match are considered; **players must match the sport** (`sportType` cricket or football).

4. **Response shape**
   - `requestedSlots`, `availablePlayers`, `filledSlots`, `squad` (ranked list with `score`, `reason`, `careerMatches`), and a human‑readable `message`.

### How to test

- **Cricket match:** `POST http://localhost:5000/api/matches/<CRICKET_MATCH_ID>/ai-squad/cricket`  
  Headers: `Authorization: Bearer <admin token>`, `Content-Type: application/json`  
  Body: `{}` or `{ "maxSlots": 11 }`

### Next step

Step 6 is the **frontend**: login (admin / player / spectator) and live score view using the APIs we built.
