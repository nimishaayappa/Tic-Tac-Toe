// Checks if the 'X' player is playing
var isTurnX = true;

// Checks if the game is over
var gameOver = false;

// Keeps track of the game board
var gameBoard = ["", "", "", "", "", "", "", "", ""];

// Keeps track of wins
var playerXWins = 0;
var playerOWins = 0;

// List of all the winning conditions
var winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Check if a play has won
// Sets variable gameOver to true if a player has won
// Returns true if a player has won
var checkWin = function () {
    for (var i = 0; i < winConditions.length; i++) {
        var a = gameBoard[winConditions[i][0]];
        var b = gameBoard[winConditions[i][1]];
        var c = gameBoard[winConditions[i][2]];
        if (a === b && b === c && a !== "") {
            gameOver = true;
            return true;
        }
    }
    return false;
};

// Check if the game is a draw
var checkDraw = function () {
    return gameBoard.every(cell => cell !== "");
};

// Click handler
// Depending on button clicked, sets the text content to X or O
// Also changes the gameBoard array
// Checks if a player has won
var clicked = function (element) {
    if (gameOver) {
        return;
    }

    var id = element.id;
    if (id < 0 || id > 8 || gameBoard[id] !== "") {
        return;
    }
    gameBoard[id] = isTurnX ? "X" : "O";
    element.textContent = gameBoard[id];

    if (checkWin()) {
        alert("Winner is " + (isTurnX ? "X" : "O"));
        if (isTurnX) {
            playerXWins++;
            document.getElementById('playerX-wins').textContent = playerXWins;
        } else {
            playerOWins++;
            document.getElementById('playerO-wins').textContent = playerOWins;
        }
        gameOver = true;
        askRestart();
    } else if (checkDraw()) {
        alert("The game is a draw!");
        gameOver = true;
        askRestart();
    }

    console.log(gameBoard);
    isTurnX = !isTurnX;
};

// Function to ask if the user wants to restart or end the game
var askRestart = function () {
    if (confirm("Do you want to play again?")) {
        restartGame();
    }
};

// Function to restart the game
var restartGame = function () {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    var cells = document.querySelectorAll('.game-board div');
    cells.forEach(cell => cell.textContent = "");
    gameOver = false;
    isTurnX = true;
};

// Function to end the game
var endGame = function () {
    alert("Thanks for playing!");
    window.close(); // This might not work in some browsers due to security reasons
};
