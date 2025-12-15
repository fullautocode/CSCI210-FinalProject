# Rock-Paper-Scissors Tournament Leaderboard

## Project Description
A Flask-based web application that manages a persistent, multi-player Rock-Paper-Scissors tournament with leaderboard tracking.

## Features
- Multi-player Rock-Paper-Scissors game
- 10-round game format
- Winner retention system (winner becomes Player 1 in next game)
- Persistent leaderboard with cumulative scores
- Dual sorting views (by name and by score)
- RESTful API endpoints
- Real-time score tracking

## Technical Implementation

### Data Structures (Required)
1. **Dictionary (LEADERBOARD)**: Global dictionary storing player statistics
   - Key: Player name (String)
   - Value: Nested dictionary with score and games_won
   - O(1) lookup and update complexity

2. **List & Sorting**: Converting dictionary to sorted lists
   - Sorted alphabetically by player name
   - Sorted numerically by score (descending)
   - Uses Python's `sorted()` function with lambda keys

### Game Logic
- **Game Length**: 10 rounds per game
- **Initial Setup**: Both players enter names
- **Winner Retention**: Previous winner retained as Player 1
- **Scoring**: Cumulative scores tracked in LEADERBOARD dictionary

### RESTful API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/player/register` | Creates new player resource |
| POST | `/api/game/start` | Initializes new 10-round game |
| POST | `/api/game/play_round` | Executes one RPS round |
| GET | `/api/leaderboard` | Retrieves sorted leaderboard |
| GET | `/api/game/state` | Gets current game state |

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone/Download the Project
```bash
cd CSCI210-FinalProject
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

Or install Flask directly:
```bash
pip install Flask==3.0.0
```

### Step 3: Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

### Step 4: Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

## How to Play

1. **Start a New Game**
   - Enter Player 1 and Player 2 names
   - Click "Start New Game"

2. **Play Rounds**
   - Player 1 selects Rock, Paper, or Scissors
   - Player 2 (computer) makes random choice
   - Round winner is displayed
   - Continue for 10 rounds

3. **Game Completion**
   - After 10 rounds, game winner is determined
   - Scores are added to leaderboard
   - Winner is retained as Player 1 for next game

4. **View Leaderboard**
   - Automatically updates after each game
   - Two views: sorted by name and by score
   - Click "Refresh Leaderboard" to update manually

## Project Structure
```
rps-tournament/
│
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── templates/
│   └── index.html             # Main HTML template
│
└── static/
    ├── css/
    │   └── style.css          # CSS styles
    └── js/
        └── game.js            # JavaScript game logic
```

## API Testing Examples

### Start a Game
```bash
curl -X POST http://localhost:5000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"player1": "Alice", "player2": "Bob"}'
```

### Play a Round
```bash
curl -X POST http://localhost:5000/api/game/play_round \
  -H "Content-Type: application/json" \
  -d '{"player1_choice": "rock"}'
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/leaderboard
```

## Requirements Met

**Data Structures**
- Dictionary (LEADERBOARD) for O(1) player lookups
- List conversion and sorting algorithms

**Game Logic**
- 10-round games
- Winner retention system
- Proper scoring and game completion

**RESTful API**
- All 4 required endpoints implemented
- Proper HTTP methods (GET/POST)
- JSON responses

**Leaderboard Display**
- Two sorting views (name & score)
- Real-time updates
- Clean, professional UI

## Technologies Used
- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Data Storage**: In-memory Python dictionaries
- **API**: RESTful JSON endpoints
