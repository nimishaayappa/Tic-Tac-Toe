document.addEventListener('DOMContentLoaded', () => {
    fetchGameState();

    document.querySelectorAll('.game-board div').forEach(cell => {
        cell.addEventListener('click', () => {
            if (cell.innerText === '') {
                makeMove(cell.id, 'X');
            }
        });
    });

    document.querySelector('button[onclick="restartGame()"]').addEventListener('click', () => {
        restartGame();
    });

    document.querySelector('button[onclick="endGame()"]').addEventListener('click', () => {
        endGame();
    });
});

let consecutiveWinsX = 0;
let highestScore = 0;
let username = '';
let lost = false;

function fetchGameState() {
    fetch('api.php?action=getGameState')
        .then(response => response.json())
        .then(data => {
            updateBoard(data);
            if (data.gameEnded) {
                showEndGameDialog();
            }
        })
        .catch(error => console.error('Error fetching game state:', error));
}

function makeMove(index, player) {
    fetch('api.php?action=makeMove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `index=${index}&player=${player}`
    })
    .then(response => response.json())
    .then(data => {
        updateBoard(data);
        if (data.gameEnded) {
            console.log("Game has ended");
            if (data.hasWon) {
                consecutiveWinsX++;
                console.log("player has won consecutively");
            } else {
                //consecutiveWinsX = 0;
                console.log ("player has lost");
                lost = true;
            }

            console.log("Consecutive Score: ", consecutiveWinsX);
            showEndGameDialog();
        } else if (player === 'X' && !data.gameEnded) {
            computerMove();
        }
    })
    .catch(error => console.error('Error making move:', error));
}

function computerMove() {
    fetch('api.php?action=getGameState')
        .then(response => response.json())
        .then(data => {
            const emptyCells = data.board.map((value, index) => value === '' ? index : null).filter(index => index !== null);
            if (emptyCells.length > 0) {
                const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                makeMove(randomIndex, 'O');
            }
        })
        .catch(error => console.error('Error fetching game state:', error));
}

function restartGame() {
    fetch('api.php?action=restartGame')
        .then(response => response.json())
        .then(data => {
            updateBoard(data);
            hideEndGameDialog(); // In case it was visible
        })
        .catch(error => console.error('Error restarting game:', error));
}

function endGame() {
    replaceHighScore();
    
    if (lost) {
        username = 'Guest';
            //consecutiveWinsX = 0;

        // reset username field
        document.getElementById('username').value = username;
        document.getElementById('display-username').innerText = username || 'Guest';
        consecutiveWinsX = 0;
        lost = false;
    }

    

    fetch('api.php?action=endGame')
        .then(response => response.json())
        .then(data => {
            updateBoard(data);
            showEndGameDialog();
        })
        .catch(error => console.error('Error ending game:', error));
}

function replaceHighScore() {

    if (consecutiveWinsX > highestScore) {
        fetch('api.php?action=replaceHighScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${username}&consecWins=${consecutiveWinsX}`
        })
        .then(response => response.json())  // Handle JSON response
        .then(data => {
            if (data.success) {
                console.log('High score replaced successfully');
            } else {
                console.error('Failed to replace high score');
            }
        })
        .catch(error => console.error('Error replacce high score:', error));
        
    }

}       

function showEndGameDialog() {
    const playAgain = window.confirm('Game Over! Do you want to play again?');
    if (playAgain) {
        restartGame();
    } else {
        fetch('api.php?action=getFinalScores')
            .then(response => response.json())
            .then(data => {
                alert(`Final Scores:\nPlayer X Wins: ${data.playerXWins}\nPlayer O Wins: ${data.playerOWins}`);
            })
            .catch(error => console.error('Error fetching final scores:', error));
    }
}

function hideEndGameDialog() {
    // Implement hiding the dialog if necessary
}

function updateBoard(data) {
    data.board.forEach((value, index) => {
        document.getElementById(index.toString()).innerText = value;
    });
    document.getElementById('playerX-wins').innerText = data.playerXWins;
    document.getElementById('playerO-wins').innerText = data.playerOWins;
}

function setUsername() {

    lost = true;
    endGame();
    
    username = document.getElementById('username').value;
    document.getElementById('display-username').innerText = username || 'Guest';
    fetch('api.php?action=setUsername', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${username}`
    })
    .then(response => response.json())
    .then(data => {
        console.log("Set username: ", username);
        console.log('High score:', data.currentUserAndHighScore[username]);
        
        highestScore = data.currentUserAndHighScore[username];
        //console.log('Highscore:', data.currentUserAndHighScore.username.);

        //restartGame();
        //updateBoard();
        // resets score with this flag

    })
    .catch(error => console.error('Error setting username:', error));
}
