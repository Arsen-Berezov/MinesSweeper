let gLevel = {
  SIZE: 4,
  MINES: 2,
};

let gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

let gBoard;
let gNums;
var gTimerIntervalId;
var gStartTime;
let resetTimer = true;
let flagsMark = true;
let lives = 2;
let allFlagsMarked = false;
let countSafeClick = 3;

function onInit() {
  gBoard = createBoard();
  console.log(gBoard);
  setMinesNegsCount(gBoard);
  if (gGame.isOn) {
    renderBoard(gBoard);
  }
}

function createBoard() {
  let board = [];
  let counter = 0;
  for (let i = 0; i < gLevel.SIZE; i++) {
    board.push([]);
    for (let j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        position: counter++,
      };
    }
  }
  resetNums();
  const flattenBoard = board.flat();
  for (let i = 0; i < gLevel.MINES; i++) {
    const randomMinesPos = drawNum();

    flattenBoard[randomMinesPos].isMine = true;
    console.log(flattenBoard[randomMinesPos].position);
  }

  return board;
}

function drawNum() {
  var randIdx = getRandomIntInclusive(0, gNums.length - 1);
  var num = gNums[randIdx];
  gNums.splice(randIdx, 1);
  return num;
}

function resetNums() {
  gNums = [];
  for (var i = 0; i < gLevel.SIZE ** 2; i++) {
    gNums[i] = i;
  }
  return gNums;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var numOfNeighbors = negsCount(board, i, j);
      board[i][j].minesAroundCount = numOfNeighbors;
    }
  }
  return board;
}

function negsCount(mat, rowIdx, colIdx) {
  var neighborsCount = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      if (mat[i][j].isMine) {
        neighborsCount++;
      }
    }
  }
  return neighborsCount;
}

function renderBoard(board) {
  var strHTML = "";

  for (var i = 0; i < gBoard.length; i++) {
    strHTML += `<tr>\n`;
    for (var j = 0; j < gBoard[i].length; j++) {
      strHTML += `\t<td class = 'cell cell-${i}-${j}' onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu = 'onCellMarked(this,${i},${j})'>${""}</td>\n`;
    }
    strHTML += `</tr>\n`;
    var elBoard = document.querySelector(".board");
    elBoard.innerHTML = strHTML;
  }
}

function onCellClicked(elCell, i, j) {
  if (resetTimer) {
    startTimer();
  }
  resetTimer = false;
  gBoard[i][j].isShown = true;
  //////
  console.log(checkGameOver());
  console.log(allFlagsMarked);
  if (checkGameOver() && allFlagsMarked) {
    document.querySelector(".smiley").innerText = "😎";
    resetTimer = true;
    clearInterval(gTimerIntervalId);
    gGame.isOn = false;
  }
  //////
  if (gGame.isOn) {
    if (gBoard[i][j].isMine) {
      elCell.innerText = "💣";
      elCell.style.backgroundColor = "red";
      if (!lives) {
        for (let i = 0; i < gBoard.length; i++) {
          for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
              document.getElementsByClassName("cell")[
                gBoard[i][j].position
              ].innerText = "💣";
              document.getElementsByClassName("cell")[
                gBoard[i][j].position
              ].style.backgroundColor = "red";
            }
          }
        }
        resetTimer = true;
        clearInterval(gTimerIntervalId);
        document.querySelector(".smiley").innerText = "😑";
        gGame.isOn = false;
      }
      lives--;
      document.querySelector(".lives").innerText = "LIVES:" + (lives + 1);
      //////////
      ////////
      ////////
      //////
    } else if (gBoard[i][j].minesAroundCount) {
      elCell.innerText = gBoard[i][j].minesAroundCount;
      ////
      document.getElementsByClassName("cell")[
        gBoard[i][j].position
      ].style.backgroundColor = "rgb(197, 255, 200)";

      ////
    } else {
      ////
      document.getElementsByClassName("cell")[
        gBoard[i][j].position
      ].style.backgroundColor = "white";
      ////
      let showArray = expandShown(gBoard, i, j);
      ////
      for (let i = 0; i < showArray.length; i++) {
        document.getElementsByClassName("cell")[showArray[i].pos].innerText =
          showArray[i].inCell;
      }
    }
  }
}

function onCellMarked(elCell, i, j) {
  gGame.markedCount++;
  gBoard[i][j].isMarked = true;
  if (flagsMark) {
    elCell.innerText = "🚩";
    elCell.style.backgroundColor = "yellow";

    window.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();
      },
      false
    );
    flagsMark = false;
    if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
      allFlagsMarked = true;
    }
  } else {
    elCell.innerText = "";
    elCell.style.backgroundColor = "bisque";
    gGame.markedCount--;
    gBoard[i][j].isMarked = false;
    window.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();
      },
      false
    );
    flagsMark = true;
  }
}

function checkGameOver() {
  let counterWin = 0;

  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isShown && !gBoard[i][j].isMine) {
        counterWin++;
        if (counterWin === gLevel.SIZE ** 2 - gLevel.MINES) {
          return (gGame.isOn = true);
        }
      }
    }
  }
}

function expandShown(board, rowIdx, colIdx) {
  let arr = [];
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      gBoard[i][j].isShown = true;
      document.getElementsByClassName("cell")[
        gBoard[i][j].position
      ].style.backgroundColor = !gBoard[i][j].minesAroundCount
        ? "white"
        : "rgb(197, 255, 200)";
      arr.push({
        pos: board[i][j].position,
        inCell:
          board[i][j].minesAroundCount !== 0
            ? board[i][j].minesAroundCount
            : "",
      });
    }
  }
  return arr;
}

function cellSize(elCell) {
  if (elCell.className === "four") {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    onInit();
  } else if (elCell.className === "eight") {
    gLevel.SIZE = 8;
    gLevel.MINES = 14;
    onInit();
  } else if (elCell.className === "twelve") {
    gLevel.SIZE = 12;
    gLevel.MINES = 32;
    onInit();
  }
}

function playAgain() {
  clearInterval(gTimerIntervalId);
  const elTimer = document.querySelector(".timer span");
  document.querySelector(".smiley").innerText = "😀";
  document.querySelector(".lives").innerText = "LIVES: 3";
  elTimer.innerText = "0.000";
  lives = 2;

  gGame.isOn = true;
  onInit();
}

function startTimer() {
  gStartTime = Date.now();
  gTimerIntervalId = setInterval(function () {
    var delta = Date.now() - gStartTime;
    var elTimer = document.querySelector(".timer span");
    elTimer.innerText = `${(delta / 1000).toFixed(3)}`;
  }, 37);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function safeClick() {
  if (countSafeClick > 0) {
    resetNums();
    let num = drawNum();
    console.log(num);
    let flatBoard = gBoard.flat();

    document.getElementsByClassName("cell")[num].innerText = !flatBoard[num]
      .isMine
      ? flatBoard[num].minesAroundCount === 0
        ? ""
        : flatBoard[num].minesAroundCount
      : "";
    document.getElementsByClassName("cell")[num].style.backgroundColor =
      "white";
  }
  countSafeClick--;
}
