// Game state tracking
let gameActive = false;
let lastWinner = null;

// DOM elements
const gameSetup = document.getElementById('gameSetup');
const gamePlay = document.getElementById('gamePlay');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const startGameBtn = document.getElementById('startGameBtn');
const newGameBtn = document.getElementById('newGameBtn');
const choiceBtns = document.querySelectorAll('.choice-btn');
const refreshLeaderboardBtn = document.getElementById('refreshLeaderboard');
const winnerRetentionText = document.getElementById('winnerRetention');

// Event listeners
startGameBtn.addEventListener('click', startNewGame);
newGameBtn.addEventListener('click', setupNewGame);
refreshLeaderboardBtn.addEventListener('click', updateLeaderboard);

choiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const choice = e.target.dataset.choice;
        playRound(choice);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLeaderboard();
    checkGameState();
});

async function checkGameState() {
    try {
        const response = await fetch('/api/game/state');
        const data = await response.json();
        
        if (data.last_winner && !data.game_active) {
            lastWinner = data.last_winner;
            showWinnerRetention();
        }
    } catch (error) {
        console.error('Error checking game state:', error);
    }
}

function showWinnerRetention() {
    if (lastWinner) {
        player1NameInput.value = lastWinner;
        player1NameInput.disabled = true;
        winnerRetentionText.textContent = `🏆 ${lastWinner} won the last game and is retained as Player 1!`;
        winnerRetentionText.style.display = 'block';
    } else {
        player1NameInput.disabled = false;
        winnerRetentionText.style.display = 'none';
    }
}

async function startNewGame() {
    const player1 = player1NameInput.value.trim();
    const player2 = player2NameInput.value.trim();
    
    if (!player1 || !player2) {
        alert('Please enter both player names!');
        return;
    }
    
    if (player1 === player2) {
        alert('Players must have different names!');
        return;
    }
    
    try {
        const response = await fetch('/api/game/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player1, player2 })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            gameActive = true;
            showGamePlay(player1, player2);
            resetGameDisplay();
        } else {
            alert(data.error || 'Failed to start game');
        }
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Failed to start game. Please try again.');
    }
}

function showGamePlay(player1, player2) {
    gameSetup.style.display = 'none';
    gamePlay.style.display = 'block';
    
    document.getElementById('currentPlayer1').textContent = player1;
    document.getElementById('currentPlayer2').textContent = player2;
    document.getElementById('p1ScoreName').textContent = player1;
    document.getElementById('p2ScoreName').textContent = player2;
}

function resetGameDisplay() {
    document.getElementById('roundNumber').textContent = '0';
    document.getElementById('player1Score').textContent = '0';
    document.getElementById('player2Score').textContent = '0';
    document.getElementById('roundResult').style.display = 'none';
    document.getElementById('gameResult').style.display = 'none';
    
    choiceBtns.forEach(btn => btn.disabled = false);
}

async function playRound(player1Choice) {
    try {
        // Disable buttons during round
        choiceBtns.forEach(btn => btn.disabled = true);
        
        const response = await fetch('/api/game/play_round', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player1_choice: player1Choice })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayRoundResult(data);
            
            if (data.game_complete) {
                displayGameResult(data);
                gameActive = false;
                lastWinner = data.last_winner;
                await updateLeaderboard();
            } else {
                // Re-enable buttons for next round
                setTimeout(() => {
                    choiceBtns.forEach(btn => btn.disabled = false);
                }, 1500);
            }
        } else {
            alert(data.error || 'Failed to play round');
            choiceBtns.forEach(btn => btn.disabled = false);
        }
    } catch (error) {
        console.error('Error playing round:', error);
        alert('Failed to play round. Please try again.');
        choiceBtns.forEach(btn => btn.disabled = false);
    }
}

function displayRoundResult(data) {
    document.getElementById('roundNumber').textContent = data.round_number;
    document.getElementById('player1Score').textContent = data.player1_score;
    document.getElementById('player2Score').textContent = data.player2_score;
    
    const resultDiv = document.getElementById('roundResult');
    const resultText = document.getElementById('resultText');
    const p1Choice = document.getElementById('p1Choice');
    const p2Choice = document.getElementById('p2Choice');
    
    p1Choice.textContent = data.player1_choice.toUpperCase();
    p2Choice.textContent = data.player2_choice.toUpperCase();
    
    if (data.round_winner === 'Tie') {
        resultText.textContent = "It's a tie!";
        resultText.style.color = '#6c757d';
    } else {
        resultText.textContent = `${data.round_winner} wins this round!`;
        resultText.style.color = '#28a745';
    }
    
    resultDiv.style.display = 'block';
}

function displayGameResult(data) {
    const gameResultDiv = document.getElementById('gameResult');
    const gameWinnerText = document.getElementById('gameWinnerText');
    
    if (data.game_winner === 'Tie') {
        gameWinnerText.textContent = "The game ended in a tie!";
        gameWinnerText.style.color = '#6c757d';
    } else {
        gameWinnerText.textContent = `${data.game_winner} wins the game with ${data.player1_score > data.player2_score ? data.player1_score : data.player2_score} points!`;
        gameWinnerText.style.color = '#28a745';
    }
    
    gameResultDiv.style.display = 'block';
    choiceBtns.forEach(btn => btn.disabled = true);
}

function setupNewGame() {
    gameSetup.style.display = 'block';
    gamePlay.style.display = 'none';
    
    // Reset player 2 input
    player2NameInput.value = '';
    
    // Show winner retention if applicable
    showWinnerRetention();
}

async function updateLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (response.ok) {
            populateLeaderboard('leaderboardByName', data.by_name);
            populateLeaderboard('leaderboardByScore', data.by_score);
        } else {
            console.error('Failed to fetch leaderboard');
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

function populateLeaderboard(tableId, players) {
    const tbody = document.getElementById(tableId);
    
    if (players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No players yet. Start a game!</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.score}</td>
            <td>${player.games_won}</td>
        `;
        tbody.appendChild(row);
    });
}
