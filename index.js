//  GAME
document.addEventListener("DOMContentLoaded", () => {

  const gameBoard = document.querySelector('.game-board');
  const gameSquares = gameBoard.querySelectorAll('.square');
  const playAsScreen = document.querySelector('.play-as-screen');
  const playingScreen = document.querySelector('.playing');
  const resetBtn = document.querySelector('.reset');

  const winsDiv = document.querySelector('.wins p');
  const drawsDiv = document.querySelector('.draws p');
  const lossesDiv = document.querySelector('.losses p');

  // get localStorage wins and losses numbers
  let wins = parseInt(localStorage.getItem('wins')) || 0;
  let draws = parseInt(localStorage.getItem('draws')) || 0;
  let losses = parseInt(localStorage.getItem('losses')) || 0;

  updateStats();

  let playerChar;
  let computerChar;
  let gameBegin = false;
  let gameBoardArr = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  playAsScreen.addEventListener('click', (e) => { 
    if (e.target.id === "as-x") {
      playerChar = 'X';
      computerChar = 'O';
      beginGame();
    } else if (e.target.id === "as-o") {
      playerChar = 'O';
      computerChar = 'X';
      beginGame();
    }
  })

  gameSquares.forEach((square, index) => {
    square.addEventListener("click", () => {
      // determine row
      const row = Math.floor(index / 3);
      // determine column
      const column = index % 3;

      if (gameBegin &&
        player(gameBoardArr) === playerChar &&
        !gameBoardArr[row][column] &&
        !terminal(gameBoardArr)
      ) {
        // place move then call for computer move
        gameBoardArr[row][column] = playerChar;
        square.textContent = playerChar;

        if (checkEndOfGame()) return;
        else {
          playingScreen.textContent = "Computer thinking...";
          setTimeout(() => {
            computerMove();
          }, 500)
        }
      }
    })
  })

  resetBtn.addEventListener('click', resetGame);

  function beginGame() {
    playAsScreen.style.display = 'none';
    gameBegin = true;

    if (playerChar === 'X') {
      playingScreen.textContent = "Your Turn";
    }
    if (playerChar === 'O') {
      computerMove();
    }
  }


  function computerMove() { 
    const move = minimax(gameBoardArr);
    gameBoardArr[move[0]][move[1]] = computerChar;
    gameSquares[(move[0] * 3) + move[1]].textContent = computerChar;

    if (checkEndOfGame()) return;

    playingScreen.textContent = "Your Turn";
  }

  function checkEndOfGame() {
    if (terminal(gameBoardArr)) {
      if (winner(gameBoardArr)) {
        if (winner(gameBoardArr)[0] === playerChar) {
          playingScreen.textContent = "You Win!";
          wins++;
          localStorage.setItem('wins', wins);
        } else if (winner(gameBoardArr)[0] === computerChar) {
          playingScreen.textContent = "Computer Wins!";
          losses++;
          localStorage.setItem('losses', losses);
          highlightWinningSquares(winner(gameBoardArr)[1]);
        }
      } else {
        playingScreen.textContent = "Draw!";
        draws++;
        localStorage.setItem('draws', draws);
      }
      resetBtn.style.display = "block";
      updateStats();
      return true;
    }
    return false;
  }

  function highlightWinningSquares(arr) {
    for (let i of arr) {
      gameSquares[(i[0] * 3) + i[1]].style.backgroundColor = "rgba(0, 255, 0, 0.1)";
    }
  }

  function resetGame() {
    gameBoardArr = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    gameSquares.forEach((square) => {
      square.textContent = '';
      square.style.backgroundColor = "transparent";
    })
    playAsScreen.style.display = 'flex';
    playingScreen.textContent = '';
    gameBegin = false;
    resetBtn.style.display = "none";
  }

  function updateStats() {
    winsDiv.textContent = wins;
    drawsDiv.textContent = draws;
    lossesDiv.textContent = losses;
  }

})


// TIC TAC TOE

// returns player who has the next turn
function player(board) {
  let xC = 0;
  let oC = 0;
  for (let i of board) {
    for (let j of i) {
      if (j === 'X') {
        xC++;
      } else if (j === 'O') {
        oC++;
      }
    }
  }
  if (xC === oC) {
    return 'X';
  } else {
    return 'O';
  }
}

// returns set of all possible actions (i, j) on board in a set
function actions(board) {
  const setV = new Set();
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) {
        setV.add([i, j]);
      }
    }
  }
  return setV;
}

// returns the board that results from making move (i, j) on board
function result(board, action) {
  if (board[action[0]][action[1]]) {
    throw new Error("action was taken already, stopping program");
  }
  const playerSign = player(board);

  // copy array
  const boardCopy = [];
  for (let i of board) {
    boardCopy.push([...i]);
  }
  boardCopy[action[0]][action[1]] = playerSign;
  return boardCopy;
}

// returns winner of game if there is one
function winner(board) {
  const signs = ['X', 'O'];

  // for X and O check winning conditions
  for (let sign of signs) {

    // these 2 are diagonal checks
    if (
      board[0][0] === sign &&
      board[1][1] === sign &&
      board[2][2] === sign
    ) {
      return [sign, [[0,0], [1,1], [2,2]]];
    }
    else if (
      board[0][2] === sign &&
      board[1][1] === sign &&
      board[2][0] === sign
    ) {
      return [sign, [[0,2], [1,1], [2,0]]];
    }
    // these 2 are horizontal and vertical checks
    for (let i = 0; i < board.length; i++) {
      if (
        board[i][0] === sign &&
        board[i][1] === sign &&
        board[i][2] === sign
      ) {
        return [sign, [[i,0], [i,1], [i,2]]];
      }
      else if (
        board[0][i] === sign &&
        board[1][i] === sign &&
        board[2][i] === sign
      ) {
        return [sign, [[0,i], [1,i], [2,i]]];
      }
    }
  }
  return null;
}

// returns true is game is over false otherwise
// game is over if there is a winner or the board is full
function terminal(board) {
  if (winner(board)) {
    return true;
  }
  for (let i of board) {
    for (let j of i) {
      if (!j) {
        return false;
      }
    }
  }
  return true;
}

// return 1 if X wins and - 1 if O wins and 0 otherwise
function utility(board) {
  if (!board) {
    return 0;
  }
  if (winner(board)) {
    if (winner(board)[0] === 'X') {
      return 1;
    }
    else if (winner(board)[0] === 'O') {
      return -1;
    }
  }
  return 0;
}

// returns the optimal action for the current player of the board
function minimax(board) {

  // return array [] with two values
  function max_value(board) {
    let optimal_move = [];
    if (terminal(board)) {
      return [utility(board), optimal_move];
    }
    else {
      let v = -5;
      const actionsArr = actions(board);
      for (let action of actionsArr) {
        const minval = min_value(result(board, action))[0];
        if (minval > v) {
          v = minval;
          optimal_move = action
        }
      }
      return [v, optimal_move];
    }
  }

  function min_value(board) {
    let optimal_move = [];
    if (terminal(board)) {
      return [utility(board), optimal_move];
    }
    else {
      let v = 5;
      const actionsArr = actions(board);
      for (let action of actionsArr) {
        const minval = max_value(result(board, action))[0];
        if (minval < v) {
          v = minval;
          optimal_move = action
        }
      }
      return [v, optimal_move];
    }
  }

  let cur_player = player(board);

  if (terminal(board)) { 
    return null;
  }

  if (cur_player === 'X') {
    return max_value(board)[1];
  } else {
    return min_value(board)[1];
  }
}