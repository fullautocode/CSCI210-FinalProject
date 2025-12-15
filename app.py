from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Central Data Store: Dictionary (LEADERBOARD)
LEADERBOARD = {}

# Game state
game_state = {
    "player1": "",
    "player2": "",
    "player1_score": 0,
    "player2_score": 0,
    "round_number": 0,
    "game_active": False,
    "last_winner": None
}

def determine_winner(choice1, choice2):
    """Determine the winner of a rock-paper-scissors round"""
    if choice1 == choice2:
        return "tie"
    
    wins = {
        "rock": "scissors",
        "scissors": "paper",
        "paper": "rock"
    }
    
    if wins[choice1] == choice2:
        return "player1"
    else:
        return "player2"

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/api/player/register', methods=['POST'])
def register_player():
    """POST /api/player/register - Creates a new player resource if they don't exist"""
    data = request.get_json()
    player_name = data.get('name', '').strip()
    
    if not player_name:
        return jsonify({"error": "Player name is required"}), 400
    
    if player_name not in LEADERBOARD:
        LEADERBOARD[player_name] = {
            "score": 0,
            "games_won": 0
        }
        return jsonify({"message": f"Player {player_name} registered successfully", "player": player_name}), 201
    else:
        return jsonify({"message": f"Player {player_name} already exists", "player": player_name}), 200

@app.route('/api/game/start', methods=['POST'])
def start_game():
    """POST /api/game/start - Initializes the state for a new 10-round game"""
    data = request.get_json()
    player1 = data.get('player1', '').strip()
    player2 = data.get('player2', '').strip()
    
    if not player1 or not player2:
        return jsonify({"error": "Both player names are required"}), 400
    
    if player1 == player2:
        return jsonify({"error": "Players must have different names"}), 400
    
    # Register players if they don't exist
    if player1 not in LEADERBOARD:
        LEADERBOARD[player1] = {"score": 0, "games_won": 0}
    if player2 not in LEADERBOARD:
        LEADERBOARD[player2] = {"score": 0, "games_won": 0}
    
    # Initialize game state
    game_state["player1"] = player1
    game_state["player2"] = player2
    game_state["player1_score"] = 0
    game_state["player2_score"] = 0
    game_state["round_number"] = 0
    game_state["game_active"] = True
    game_state["last_winner"] = None
    
    return jsonify({
        "message": "Game started successfully",
        "player1": player1,
        "player2": player2,
        "rounds_total": 10
    }), 200

@app.route('/api/game/play_round', methods=['POST'])
def play_round():
    """POST /api/game/play_round - Executes one round of RPS and updates scores"""
    if not game_state["game_active"]:
        return jsonify({"error": "No active game. Start a new game first."}), 400
    
    if game_state["round_number"] >= 10:
        return jsonify({"error": "Game is complete. Start a new game."}), 400
    
    data = request.get_json()
    player1_choice = data.get('player1_choice', '').lower()
    
    valid_choices = ['rock', 'paper', 'scissors']
    if player1_choice not in valid_choices:
        return jsonify({"error": "Invalid choice. Must be rock, paper, or scissors."}), 400
    
    # Computer (Player 2) makes random choice
    player2_choice = random.choice(valid_choices)
    
    # Determine round winner
    result = determine_winner(player1_choice, player2_choice)
    
    # Update round scores
    if result == "player1":
        game_state["player1_score"] += 1
        round_winner = game_state["player1"]
    elif result == "player2":
        game_state["player2_score"] += 1
        round_winner = game_state["player2"]
    else:
        round_winner = "Tie"
    
    game_state["round_number"] += 1
    
    # Check if game is complete (10 rounds)
    game_complete = game_state["round_number"] >= 10
    game_winner = None
    
    if game_complete:
        # Update LEADERBOARD with cumulative scores
        p1_name = game_state["player1"]
        p2_name = game_state["player2"]
        
        LEADERBOARD[p1_name]["score"] += game_state["player1_score"]
        LEADERBOARD[p2_name]["score"] += game_state["player2_score"]
        
        # Determine game winner
        if game_state["player1_score"] > game_state["player2_score"]:
            game_winner = p1_name
            LEADERBOARD[p1_name]["games_won"] += 1
        elif game_state["player2_score"] > game_state["player1_score"]:
            game_winner = p2_name
            LEADERBOARD[p2_name]["games_won"] += 1
        else:
            game_winner = "Tie"
        
        game_state["last_winner"] = game_winner if game_winner != "Tie" else None
        game_state["game_active"] = False
    
    return jsonify({
        "round_number": game_state["round_number"],
        "player1_choice": player1_choice,
        "player2_choice": player2_choice,
        "round_winner": round_winner,
        "player1_score": game_state["player1_score"],
        "player2_score": game_state["player2_score"],
        "game_complete": game_complete,
        "game_winner": game_winner,
        "last_winner": game_state["last_winner"]
    }), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """GET /api/leaderboard - Retrieves the complete leaderboard with sorting"""
    # Convert Dictionary to List of Dictionaries
    leaderboard_list = []
    for player_name, stats in LEADERBOARD.items():
        leaderboard_list.append({
            "name": player_name,
            "score": stats["score"],
            "games_won": stats["games_won"]
        })
    
    # Sort by name (alphabetically)
    sorted_by_name = sorted(leaderboard_list, key=lambda x: x["name"].lower())
    
    # Sort by score (descending)
    sorted_by_score = sorted(leaderboard_list, key=lambda x: x["score"], reverse=True)
    
    return jsonify({
        "by_name": sorted_by_name,
        "by_score": sorted_by_score,
        "total_players": len(leaderboard_list)
    }), 200

@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    """GET current game state"""
    return jsonify({
        "player1": game_state["player1"],
        "player2": game_state["player2"],
        "player1_score": game_state["player1_score"],
        "player2_score": game_state["player2_score"],
        "round_number": game_state["round_number"],
        "game_active": game_state["game_active"],
        "last_winner": game_state["last_winner"]
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
