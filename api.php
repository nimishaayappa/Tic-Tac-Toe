<?php
session_start();

// Initialize the game state and leaderboard if not already set
if (!isset($_SESSION['game'])) {
    $_SESSION['game'] = [
        'board' => array_fill(0, 9, ''),
        'currentPlayer' => 'X',
        'playerXWins' => 0,
        'playerOWins' => 0,
        'gameEnded' => false, // New flag to track if the game has ended
        'hasWon' => false // If user has won
    ];
}

if (!isset($_SESSION['leaderboard'])) {
    $_SESSION['leaderboard'] = [
        'userScores' => [],
        'currentUserAndHighScore' => [],
    ];
}

// Handle API requests
header('Content-Type: application/json');

$action = $_GET['action'] ?? null;

switch ($action) {
    case 'getGameState':
        echo json_encode($_SESSION['game']);
        break;

    case 'makeMove':
        $index = $_POST['index'] ?? null;
        if ($index !== null && $_SESSION['game']['board'][$index] === '' && !$_SESSION['game']['gameEnded']) {
            $_SESSION['game']['board'][$index] = $_SESSION['game']['currentPlayer'];
            if (checkWin($_SESSION['game']['board'], $_SESSION['game']['currentPlayer'])) {
                if ($_SESSION['game']['currentPlayer'] == 'X') {
                    $_SESSION['game']['playerXWins']++;
                    $_SESSION['game']['hasWon'] = true;
                } else {
                    $_SESSION['game']['playerOWins']++;
                    $_SESSION['game']['hasWon'] = false;
                }
                $_SESSION['leaderboard'][] = [
                    'player' => $_SESSION['game']['currentPlayer'],
                    'timestamp' => time()
                ];
                $_SESSION['leaderboard'] = array_slice($_SESSION['leaderboard'], -10); // Keep top 10 scores
                $_SESSION['game']['gameEnded'] = true; // Set game ended flag
            } else {
                // Switch player turn if no winner yet
                $_SESSION['game']['currentPlayer'] = $_SESSION['game']['currentPlayer'] == 'X' ? 'O' : 'X';
            }
        }
        echo json_encode($_SESSION['game']);
        break;

    case 'restartGame':
        $_SESSION['game']['board'] = array_fill(0, 9, '');
        $_SESSION['game']['currentPlayer'] = 'X';
        $_SESSION['game']['gameEnded'] = false; // Reset game ended flag
        echo json_encode($_SESSION['game']);
        break;

    case 'endGame':
        $_SESSION['game']['board'] = array_fill(0, 9, '');
        $_SESSION['game']['currentPlayer'] = 'X';
        $_SESSION['game']['playerXWins'] = 0;
        $_SESSION['game']['playerOWins'] = 0;
        $_SESSION['game']['gameEnded'] = false; // Reset game ended flag
        echo json_encode($_SESSION['game']);
        break;

    case 'getLeaderboard':
        echo json_encode($_SESSION['leaderboard']);
        break;

    case 'getFinalScores':
        echo json_encode([
            'playerXWins' => $_SESSION['game']['playerXWins'],
            'playerOWins' => $_SESSION['game']['playerOWins']
        ]);
        break;

    case 'getUserScores':
        echo json_encode($_SESSION['leaderboard']['userScores']);
        break;

    case 'setUsername':
        $username = $_POST['username'] ?? 'Guest';
        
        if (!isset($_SESSION['leaderboard']['userScores'])) {
            $_SESSION['leaderboard']['userScores'] = [];
        }

        if (array_key_exists($username, $_SESSION['leaderboard']['userScores'])) {
           
            $_SESSION['leaderboard']['currentUserAndHighScore'][$username] = 
            $_SESSION['leaderboard']['userScores'][$username];
           
        } else {
            
            //$_SESSION['game']['userScores'][$username] = 0; 
            $_SESSION['leaderboard']['userScores'][$username] = 0;
            $_SESSION['leaderboard']['currentUserAndHighScore'][$username] = 0;
            
        }

        echo json_encode([
            'currentUserAndHighScore' => $_SESSION['leaderboard']['currentUserAndHighScore'] 
        ]);
        break;

    case 'replaceHighScore':
        $username = $_POST['username'] ?? 'Guest';
        $newScore = $_POST['consecWins'];

        $_SESSION['leaderboard']['userScores'][$username] = $newScore;
        
        echo json_encode(['success' => true]);
    
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

// Function to check if a player has won
function checkWin($board, $player) {
    $winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    foreach ($winningCombinations as $combination) {
        if ($board[$combination[0]] == $player && $board[$combination[1]] == $player && $board[$combination[2]] == $player) {
            return true;
        }
    }
    return false;
}
?>
