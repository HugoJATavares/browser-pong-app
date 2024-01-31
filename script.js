const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const width = 450;
const height = 650;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;
let originalPaddleColor = 'white'

let ballX = 250;
let ballY = 350;
const ballRadius = 5;

let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 25;
}

let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

function renderCanvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);
  context.fillStyle = originalPaddleColor;
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 325);
  context.lineTo(900, 325);
  context.strokeStyle = 'grey';
  context.stroke();

  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

createCanvas();

function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

function ballMove() {
  ballY += -speedY;

  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

function ballBoundaries() {
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }

  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }

  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;

      originalPaddleColor = 'red'; 
      setTimeout(() => {
        originalPaddleColor = 'white';
      }, 200);

      if (playerMoved) {
        speedY -= 1;

        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      ballReset();
      computerScore++;
    }
  }

  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      paddleContact = true;

      originalPaddleColor = 'blue'; 
      setTimeout(() => {
        originalPaddleColor = 'white'; 
      }, 200);

      if (playerMoved) {
        speedY += 1;

        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      ballReset();
      playerScore++;
    }
  }
}

function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX && paddleTopX + paddleWidth < width) {
      paddleTopX += computerSpeed;
    } else if (paddleTopX > 0) {
      paddleTopX -= computerSpeed;
    }
  }
}

function showGameOverEl(winner) {
  canvas.hidden = true;

  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');

  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;

  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';

  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);

}

function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    let winner = playerScore === winningScore ? 'Player 1' : 'Computer';
    showGameOverEl(winner);
  }
}

function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
}

function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;


  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();

  canvas.addEventListener('mousemove', (e) => {

    playerMoved = true;

    paddleBottomX = e.clientX - canvas.getBoundingClientRect().left - paddleWidth / 2;
updatePaddlePosition();

    canvas.style.cursor = 'none';
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    playerMoved = true;
    paddleBottomX = e.touches[0].clientX - canvas.getBoundingClientRect().left - paddleWidth / 2;
    updatePaddlePosition();
  });

}

function updatePaddlePosition() {
  if (paddleBottomX < 0) {
    paddleBottomX = 0;
  }
  if (paddleBottomX > width - paddleWidth) {
    paddleBottomX = width - paddleWidth;
  }
}

startGame();
