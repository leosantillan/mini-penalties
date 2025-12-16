# Mini Cup Game - API Contracts & Integration Plan

## 1. API Endpoints

### Teams API
- **GET /api/teams** - Get all teams with their global goal counts
  - Response: `[{ id, name, country, flag, color, goals }]`
  
- **POST /api/teams/goal** - Add goals to a team
  - Request: `{ team_id, goals }`
  - Response: `{ success, new_total }`

### Game Sessions API
- **POST /api/game/start** - Start a new game session
  - Request: `{ team_id }`
  - Response: `{ session_id, team }`

- **POST /api/game/score** - Record game score
  - Request: `{ session_id, team_id, score }`
  - Response: `{ success, global_rank }`

### Leaderboard API
- **GET /api/leaderboard** - Get global team standings
  - Response: `[{ rank, team_id, name, country, flag, goals }]`

- **GET /api/game/history** - Get recent game history
  - Response: `[{ id, team_name, score, timestamp }]`
  - Query params: `?limit=20`

## 2. Mock Data to Replace

### From mock.js:
1. **mockTeams** array - Will be fetched from MongoDB teams collection
2. **mockGameHistory** - Will be fetched from MongoDB game_sessions collection
3. **addGoalsToTeam()** - Will call POST /api/teams/goal
4. **addGameHistory()** - Will call POST /api/game/score

## 3. MongoDB Collections

### teams
```
{
  _id: ObjectId,
  team_id: Number,
  name: String,
  country: String,
  flag: String,
  color: String,
  goals: Number,
  created_at: DateTime
}
```

### game_sessions
```
{
  _id: ObjectId,
  session_id: String,
  team_id: Number,
  team_name: String,
  score: Number,
  timestamp: DateTime
}
```

## 4. Frontend Changes Required

### LandingPage.jsx
- Replace `mockTeams` with API call to GET /api/teams
- Calculate total goals from fetched teams

### TeamSelection.jsx
- Fetch teams from GET /api/teams instead of mock
- Real-time update when returning to this page

### MiniCupGame.jsx
- Replace `addGoalsToTeam()` with POST /api/teams/goal
- Replace `addGameHistory()` with POST /api/game/score
- Start game session with POST /api/game/start

## 5. Integration Strategy

1. Create MongoDB models for teams and game_sessions
2. Create backend API endpoints
3. Update frontend components to use axios for API calls
4. Add error handling and loading states
5. Test end-to-end flow

## 6. Key Features to Maintain
- Real-time global scoring
- Persistent leaderboard rankings
- Game history tracking
- Smooth gameplay experience
