'use strict';

var isRunning = false;
var board = [];
var nextFrame;
var lastFrameTime;
var frameDeltas = [];

window.addEventListener('load', setup);

function setup() {
  document.getElementById('width').addEventListener('input', changeDimensions);
  document.getElementById('height').addEventListener('input', changeDimensions);
  document.getElementById('step').addEventListener('click', step);
  document.getElementById('run').addEventListener('click', toggleRunState);

  changeDimensions();
}

function clickHandler(td, i, j) {
  return function() {
    var color = document.getElementById('color').value;
    if (board[i][j] === color) {
      board[i][j] = null;
      td.style.removeProperty('background-color');
    } else {
      board[i][j] = color;
      td.style.setProperty('background-color', color);
    }
  };
}


function changeDimensions() {
  board.length = Number(document.getElementById('width').value) + 2;
  for (var i = 0; i < board.length; i++) {
    board[i] = board[i] || []
    board[i].length = Number(document.getElementById('height').value) + 2;
  }

  for (var i = 1; i < board.length - 1; i++) {
    var tr = document.createElement("tr");
    document.getElementById("board").appendChild(tr);
    for (var j = 1; j < board[i].length - 1; j++) {
      var td = document.createElement("td");
      tr.appendChild(td);
      td.addEventListener('click', clickHandler(td, i, j));
    }
  }
  step();
}

function updateDisplay() {
  var domBoard = document.getElementById("board");
  for (var i = 1; i < board.length - 1; i++) {
    for (var j = 1; j < board[i].length - 1; j++) {
      domBoard.children[i - 1].children[j - 1].style.setProperty('background-color', board[i][j]);
    }
  }
}

function average(colors) {
  var totalRed = 0;
  var totalGreen = 0;
  var totalBlue = 0;

  colors.forEach(function(color) {
    var red = parseInt(color.substring(1, 3), 16);
    var green = parseInt(color.substring(3, 5), 16);
    var blue = parseInt(color.substring(5, 7), 16);
    totalRed += red;
    totalGreen += green;
    totalBlue += blue;
  });

  totalRed = (totalRed / colors.length) | 0;
  totalGreen = (totalGreen / colors.length) | 0;
  totalBlue = (totalBlue / colors.length) | 0;

  return '#' + totalRed.toString(16) + totalGreen.toString(16) + totalBlue.toString(16);
}

function countNeighbors(i, j) {
  var neighbors = 0;
  var colors = [];

  function checkNeighbor(x, y) {
    if (board[x][y]) {
      colors.push(board[x][y]);
      neighbors++;
    }
  }
  checkNeighbor(i - 1, j);
  checkNeighbor(i - 1, j - 1);
  checkNeighbor(i - 1, j + 1);
  checkNeighbor(i, j - 1);
  checkNeighbor(i, j + 1);
  checkNeighbor(i + 1, j);
  checkNeighbor(i + 1, j - 1);
  checkNeighbor(i + 1, j + 1);

  return [average(colors), neighbors]
}

function step() {
  var newBoard = new Array(board.length);
  for (var i = 0; i < board.length; i++) {
    newBoard[i] = new Array(board[i].length);
    for (var j = 0; j < newBoard[i].length; j++) {
      newBoard[i][j] = null;
    }
  }

  for (var i = 1; i < board.length - 1; i++) {
    for (var j = 1; j < board[i].length - 1; j++) {
      var [averageColor, neighbors] = countNeighbors(i, j);

      if (board[i][j] !== null) {
        if (neighbors == 2 || neighbors == 3) {
          newBoard[i][j] = board[i][j];
        }
      } else {
        if (neighbors == 3) {
          newBoard[i][j] = averageColor;
        }
      }
    }
  }

  board = newBoard;
  updateDisplay();
}

function animate() {
  var currentTime = new Date();
  if (lastFrameTime) {
    if (frameDeltas.length >= 50) {
      frameDeltas.shift();
    }
    frameDeltas.push(1000/(currentTime - lastFrameTime));

    var average = 0;
    for (var i = 0; i < frameDeltas.length; i++) {
      average += frameDeltas[i];
    }
    average /= frameDeltas.length;

    document.getElementById('fps').textContent = average.toFixed(2);
  }
  lastFrameTime = currentTime;
  step();
  nextFrame = requestAnimationFrame(animate);
}

function toggleRunState() {
  if (!isRunning) {
    isRunning = true;
    nextFrame = requestAnimationFrame(animate);
    this.textContent = 'Stop';
  } else {
    isRunning = false;
    cancelAnimationFrame(nextFrame);
    this.textContent = 'Run';
  }
}
