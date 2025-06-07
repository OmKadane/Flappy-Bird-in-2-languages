// Game constants
const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 600;
const FPS = 60;

// Game state
let gameState = 1;
let score = 0;
let hasMoved = false;
let colorCycle = 0;
let gameOver = false;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

// Load images
const playerImg = new Image();
const pipeUpImg = new Image();
const pipeDownImg = new Image();
const groundImg = new Image();
const bgImg = new Image();

playerImg.src = 'images/player.png';
pipeUpImg.src = 'images/pipe_up.png';
pipeDownImg.src = 'images/pipe_down.png';
groundImg.src = 'images/ground.png';
bgImg.src = 'images/background.png';

// Load sounds
const slapSound = new Audio('sounds/slap.wav');
const wooshSound = new Audio('sounds/woosh.wav');
const scoreSound = new Audio('sounds/score.wav');

// Game variables
const bgScrollSpeed = 1;
const groundScrollSpeed = 2;
let bgXPos = 0;
let groundXPos = 0;

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
    }

    jump() {
        this.velocity = -10;
        this.rotation = 30;
        wooshSound.play();
    }

    update() {
        this.velocity += 0.75;
        this.y += this.velocity;

        if (this.velocity < 0) {
            this.rotation = 30;
        } else {
            this.rotation = Math.max(-90, this.rotation - 3);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + playerImg.width / 2, this.y + playerImg.height / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(playerImg, -playerImg.width / 2, -playerImg.height / 2);
        ctx.restore();
    }
}

// Pipe class
class Pipe {
    constructor(x, height, gap, velocity) {
        this.x = x;
        this.height = height;
        this.gap = gap;
        this.velocity = velocity;
        this.scored = false;
    }

    update() {
        this.x -= this.velocity;
    }

    draw() {
        // Draw top pipe
        ctx.drawImage(pipeDownImg, this.x, 0 - pipeDownImg.height + this.height);
        // Draw bottom pipe
        ctx.drawImage(pipeUpImg, this.x, this.height + this.gap);
    }
}

// Create player and pipes
let player = new Player(168, 300);
let pipes = [new Pipe(600, Math.floor(Math.random() * 220) + 30, 220, 2.4)];

function drawScoreboard() {
  // Detect if the device is mobile
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const startText = isMobile ? 'Tap to Start' : 'Press SPACE to Start';
  const restartText = isMobile ? 'Tap to Restart' : 'Press SPACE to Restart';

  if (hasMoved) {
      if (!gameOver) {
          ctx.font = '700 80px "Bai Jamjuree"';
          ctx.fillStyle = '#0a2809';
          ctx.textAlign = 'center';
          ctx.fillText(score.toString(), WINDOW_WIDTH / 2, 64);
      }

      if (gameOver) {
          colorCycle = (colorCycle + 1) % 360;
          const r = Math.floor(255 * Math.abs(Math.sin(colorCycle * Math.PI / 180)));
          const g = Math.floor(255 * Math.abs(Math.sin((colorCycle + 120) * Math.PI / 180)));
          const b = Math.floor(255 * Math.abs(Math.sin((colorCycle + 240) * Math.PI / 180)));

          ctx.font = '700 50px "Bai Jamjuree"';
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.textAlign = 'center';
          ctx.fillText('Game Over !', WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 - 30);

          ctx.font = '700 25px "Bai Jamjuree"';
          ctx.fillStyle = '#0a2809';
          ctx.textAlign = 'center';
          ctx.fillText(restartText, WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 30);
      }
  } else {
      colorCycle = (colorCycle + 1) % 360;
      const r = Math.floor(255 * Math.abs(Math.sin(colorCycle * Math.PI / 180)));
      const g = Math.floor(255 * Math.abs(Math.sin((colorCycle + 120) * Math.PI / 180)));
      const b = Math.floor(255 * Math.abs(Math.sin((colorCycle + 240) * Math.PI / 180)));

      ctx.font = '700 45px "Bai Jamjuree"';
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.textAlign = 'center';
      ctx.fillText('Flappy JS', WINDOW_WIDTH / 2, 80);

      ctx.font = '700 25px "Bai Jamjuree"';
      ctx.fillStyle = '#0a2809';
      ctx.textAlign = 'center';
      ctx.fillText(startText, WINDOW_WIDTH / 2, 120);
  }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

    // Draw background
    ctx.drawImage(bgImg, bgXPos, 0);
    ctx.drawImage(bgImg, bgXPos + bgImg.width, 0);
    bgXPos -= bgScrollSpeed;
    if (bgXPos <= -bgImg.width) bgXPos = 0;

    // Draw ground
    ctx.drawImage(groundImg, groundXPos, 536);
    ctx.drawImage(groundImg, groundXPos + bgImg.width, 536);
    groundXPos -= groundScrollSpeed;
    if (groundXPos <= -bgImg.width) groundXPos = 0;

    if (hasMoved && !gameOver) {
        player.update();

        // Collision detection
        const playerRect = {
            x: player.x,
            y: player.y,
            width: playerImg.width,
            height: playerImg.height
        };

        for (let pipe of pipes) {
            const pipeTopRect = {
                x: pipe.x,
                y: 0,
                width: pipeUpImg.width,
                height: pipe.height
            };

            const pipeBottomRect = {
                x: pipe.x,
                y: pipe.height + pipe.gap,
                width: pipeUpImg.width,
                height: WINDOW_HEIGHT - (pipe.height + pipe.gap)
            };

            if (checkCollision(playerRect, pipeTopRect) || checkCollision(playerRect, pipeBottomRect)) {
                gameOver = true;
                slapSound.play();
            }
        }

        // Check if player hits ground or ceiling
        if (player.y < -64 || player.y > 536) {
            gameOver = true;
            slapSound.play();
        }

        // Update pipes
        for (let pipe of pipes) {
            pipe.update();
        }

        // Remove off-screen pipes and add new ones
        if (pipes[0].x < -pipeUpImg.width) {
            pipes.shift();
            pipes.push(new Pipe(400, Math.floor(Math.random() * 250) + 30, 220, 2.4));
        }

        // Score points
        for (let pipe of pipes) {
            if (!pipe.scored && pipe.x + pipeUpImg.width < player.x) {
                score++;
                scoreSound.play();
                pipe.scored = true;
            }
        }
    }

    // Draw pipes
    for (let pipe of pipes) {
        pipe.draw();
    }

    // Draw player
    player.draw();

    // Draw scoreboard
    drawScoreboard();

    requestAnimationFrame(gameLoop);
}

// Collision detection helper
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Event listeners
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
      if (gameOver) {
          // Reset game
          player = new Player(168, 300);
          pipes = [new Pipe(600, Math.floor(Math.random() * 220) + 30, 220, 2.4)];
          score = 0;
          hasMoved = false;
          gameOver = false;
      } else {
          hasMoved = true;
          player.jump();
      }
  }
});

// Add touch support for mobile devices
document.addEventListener('touchstart', () => {
  if (gameOver) {
      player = new Player(168, 300);
      pipes = [new Pipe(600, Math.floor(Math.random() * 220) + 30, 220, 2.4)];
      score = 0;
      hasMoved = false;
      gameOver = false;
  } else {
      hasMoved = true;
      player.jump();
  }
});

// Start game loop when all images are loaded
let loadedImages = 0;
const totalImages = 5;

function imageLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
        gameLoop();
    }
}

playerImg.onload = imageLoaded;
pipeUpImg.onload = imageLoaded;
pipeDownImg.onload = imageLoaded;
groundImg.onload = imageLoaded;
bgImg.onload = imageLoaded;
