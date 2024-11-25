<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Canvas Game</title>
  <style>
    body {
      margin: 0;
      background-color: #000;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      overflow: hidden;
    }
    canvas {
      border: 2px solid #fff;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <script>
    // JavaScript code starts here
    let canvas;
    let canvasContext;

    // Game Config
    const FRAMES_PER_SECOND = 30;
    const FLEET_SIDE_MARGIN = 80;
    const FLEET_TOP_MARGIN = 100;
    const PLAYER_SIDE_MARGIN = 10;
    const PLAYER_BOT_MARGIN = 50;
    const INSTRUCTIONS = 'LEFT / RIGHT ARROWS TO MOVE  |  SPACE TO FIRE';
    const GAME_OVER = 'Game Over!';
    const GAME_OVER_COLOR = 'white';
    const SCORE_INCREMENT = 100;
    const SCORE_COLOR = '#99ff99';
    const PLAYER_LIVES = 3;
    const MAX_LEVEL = 6;

    // Enemy/Fleet Config
    let enemyVelocityX = 15;
    let enemyVelocityY = 0; 
    const ENEMY_HEIGHT = 30; 
    const ENEMY_WIDTH = 60; 
    const ENEMY_COLOR = '#ffcccc';
    const FLEET_ROWS = 6;
    const FLEET_COLUMNS = 6;
    const FLEET_WIDTH_RATIO = 0.6; 
    const FLEET_HEIGHT_RATIO = 0.5; 
    const FLEET_MOVE_RATE = 1000; 
    const ENEMY_FIRE_RATE = 1000; 
    const ENEMY_BULLET_VELOCITY_Y = 5;

    // Player Config
    const PLAYER_HEIGHT = 40;
    const PLAYER_WIDTH = 30;
    const PLAYER_COLOR = '#99ccff';
    const PLAYER_VELOCITY_X = 15;

    // Bullet Config
    const BULLET_VELOCITY_Y = 20;
    const BULLET_HEIGHT = 15; 
    const BULLET_WIDTH = 6; 
    const BULLET_HITBOX_SIZE = 20; 
    const BULLET_RATE = 1500; 
    const BULLET_EMOJI = '✝'; 

    // Positions & Timer
    let score = 0;
    let lives = PLAYER_LIVES;
    let gameStart = false;
    let gameOver = false;
    let enemyFleet = {};
    let fleetCenterX;
    let fleetCenterY;
    let fleetMovementTimer = 0;
    let playerCenterX;
    let playerCenterY;
    let bullets = [];
    let enemyBullets = [];
    let bulletTimer = BULLET_RATE;
    let bulletCooldown = false;
    let enemyBulletTimer = ENEMY_FIRE_RATE;
    let level = 1; 
    const enemyEmojis = ['👾', '👽', '💀', '👻', '👺', '👹']; 

    // On Load
    window.onload = function() {
      canvas = document.getElementById('gameCanvas');
      canvasContext = canvas.getContext('2d');

      positionFleet();
      positionPlayer();

      setInterval(runAll, 1000 / FRAMES_PER_SECOND);

      document.addEventListener('keydown', movePlayer);
      document.addEventListener('keydown', fireBullet);
    };

    // Functions (same as the original code provided, structured properly)
    // Umbrella Run All
    function runAll() {
      fleetMovementTimer += 1000 / FRAMES_PER_SECOND;
      enemyBulletTimer += Math.random() * 1000 / FRAMES_PER_SECOND;
      reloadBullet();
      moveEverything();
      drawEverything();
}

// Initial Enemy Fleet Position
function positionFleet() {
  fleetWidth = canvas.width * FLEET_WIDTH_RATIO;
  fleetHeight = canvas.height * FLEET_HEIGHT_RATIO;

  // Fleet container position
  fleetCenterX = canvas.width / 2;
  fleetCenterY = FLEET_TOP_MARGIN + (FLEET_HEIGHT_RATIO * canvas.height) / 2;

  // Build fleet array based on given rows/columns
  for (let i = 0; i < FLEET_ROWS; ++i) {
    for (let j = 0; j < FLEET_COLUMNS; ++j) {
      // Spaces fleet out based on given fleet width/height
      let position = [
        i * (fleetWidth) / (FLEET_COLUMNS - 1) + (canvas.width / 2 - fleetWidth / 2),
        j * (fleetHeight) / (FLEET_ROWS - 1) + FLEET_TOP_MARGIN - 25 // Adjust the value (-50) as needed
      ];
      // Assign enemy designation/positions as key/value pairs
      enemyFleet[i * FLEET_ROWS + j] = position;
    }
  }
}

// Initial Player Position
function positionPlayer() {
  playerCenterX = canvas.width / 2;
  playerCenterY = canvas.height - PLAYER_BOT_MARGIN;
}

// Fire Bullet
function fireBullet(e) {
  // Start game if space is pressed
  if (gameStart === false && e.key === ' ') gameStart = true;

  // Only fire when bullet is not on cooldown
  if (e.key === ' ' && bulletCooldown === false) {
    bullets.push([playerCenterX, playerCenterY - PLAYER_HEIGHT / 2]); // add a bullet (coordinates) to array
    bulletCooldown = true; // set bullet on cooldown

    // Add random bullets between the first and second shot
    if (bullets.length === 2) {
      const randomBullets = Math.floor(Math.random() * 3) + 1; // Random number of bullets between 1 and 3
      for (let i = 0; i < randomBullets; i++) {
        bullets.push([playerCenterX + Math.random() * 10 - 5, playerCenterY - PLAYER_HEIGHT / 2]); // Randomize bullet positions around the player
      }
    }
  }
}

// Reload Bullet
function reloadBullet() {
  // Begin bullet reload
  if (bulletCooldown === true) {
    bulletTimer -= 1000 / FRAMES_PER_SECOND;
  }
  // After reload time, set cooldown to false and reset bullet timer
  if (bulletTimer < 0) {
    bulletCooldown = false;
    bulletTimer = BULLET_RATE;
  }
}

// Move Player
function movePlayer(e) {
  if (gameStart === false && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) gameStart = true; // remove instructions once correct keys are pressed
  // Move player based on keydown, bound by side margins
  switch (e.key) {
    case 'ArrowLeft':
      if (playerCenterX > PLAYER_SIDE_MARGIN) playerCenterX -= PLAYER_VELOCITY_X;
      break;
    case 'ArrowRight':
      if (playerCenterX < canvas.width - PLAYER_SIDE_MARGIN) playerCenterX += PLAYER_VELOCITY_X;
      break;
  }
}

// Umbrella Move
function moveEverything() {
  if (gameStart && !gameOver) {
    moveFleet();
    moveBullet();
    bulletDetection();
    moveEnemyBullets();
    checkPlayerHit();
    checkLevelCompletion();
    enemyFire(); // New function to handle enemy firing
  }
}

// Move Bullet
function moveBullet() {
  for (let bullet of bullets) {
    bullet[1] -= BULLET_VELOCITY_Y;
  }
}

// Move Enemy Bullets
function moveEnemyBullets() {
  for (let bullet of enemyBullets) {
    bullet[1] += ENEMY_BULLET_VELOCITY_Y;
  }
}

// Detect bullet offscreen or collision
function bulletDetection() {
  // Check each bullet in array
  for (let i = 0; i < bullets.length; ++i) {
    let selectedBullet = bullets[i];
    // If offscreen, delete bullet and continue
    if (selectedBullet[1] < 0) {
      bullets.splice(i, 1);
      continue; // no need to check collision against enemy ships
    }
    // Check collision against each enemy ship
    for (let enemy in enemyFleet) {
      // Collision by matching coordinates
      if (
        selectedBullet[0] < enemyFleet[enemy][0] + ENEMY_WIDTH / 2 &&
        selectedBullet[0] > enemyFleet[enemy][0] - ENEMY_WIDTH / 2 &&
        selectedBullet[1] - BULLET_HEIGHT / 2 < enemyFleet[enemy][1] + ENEMY_HEIGHT / 2
      ) {
        delete enemyFleet[enemy]; // delete enemy ship from object
        bullets.splice(i, 1); // delete bullet
        score += SCORE_INCREMENT; // increase score
        break; // no need to check the remaining enemy ships
      }
    }
  }
  
  // Check each bullet in array
  for (let i = 0; i < enemyBullets.length; ++i) {
    let selectedBullet = enemyBullets[i];
    // If offscreen, delete bullet and continue
    if (selectedBullet[1] > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }
  }
}

// Check if player is hit by enemy bullet
function checkPlayerHit() {
  const playerHitBoxWidth = 40; // Increased hit box width
  const playerHitBoxHeight = 40; // Increased hit box height
  
  for (let bullet of enemyBullets) {
    if (
      playerCenterX > bullet[0] - BULLET_WIDTH / 2 - playerHitBoxWidth / 2 &&
      playerCenterX < bullet[0] + BULLET_WIDTH / 2 + playerHitBoxWidth / 2 &&
      playerCenterY > bullet[1] - BULLET_HEIGHT / 2 - playerHitBoxHeight / 2 &&
      playerCenterY < bullet[1] + BULLET_HEIGHT / 2 + playerHitBoxHeight / 2
    ) {
      lives--;
      if (lives === 0) {
        gameOver = true;
      } else {
        playerCenterX = canvas.width / 2;
        playerCenterY = canvas.height - PLAYER_BOT_MARGIN;
      }
      enemyBullets.splice(enemyBullets.indexOf(bullet), 1);
      break;
    }
  }
}

// Check if all invaders are destroyed or off screen
function checkLevelCompletion() {
  if (Object.keys(enemyFleet).length === 0 || isFleetOffScreen()) {
    if (level < MAX_LEVEL) {
      level++;
      initializeLevel();
    } else {
      gameOver = true; // Game ends after completing all levels
    }
  }
}

// Check if the fleet is off screen (reached the bottom)
function isFleetOffScreen() {
  for (let key in enemyFleet) {
    if (enemyFleet[key][1] + ENEMY_HEIGHT / 2 >= canvas.height) {
      return true;
    }
  }
  return false;
}

// Move Enemy Fleet
function moveFleet() {
  // Limits fleet movement rate
  if (fleetMovementTimer > FLEET_MOVE_RATE) {
    // Moves individual enemies
    for (let key in enemyFleet) {
      enemyFleet[key][0] += enemyVelocityX;
    }
    // Moves fleet position
    fleetCenterX += enemyVelocityX;
    // Changes fleet horizontal movement direction when at edge
    if (fleetCenterX - fleetWidth / 4 < FLEET_SIDE_MARGIN || fleetCenterX + fleetWidth / 2 > canvas.width - FLEET_SIDE_MARGIN) {
      enemyVelocityX *= -1;
      fleetCenterY += enemyVelocityY / 8; // moves the fleet down based on half of the Y speed
      enemyVelocityX *= 1.05; // Increase enemy speed

      // Move fleet closer to the player
      for (let key in enemyFleet) {
        enemyFleet[key][1] += 20;
      }

      // Increase enemy speed for each row
      enemyVelocityX *= 1.20;
    }
    // Reset fleet movement timer
    fleetMovementTimer = 0;
  }
}

// Initialize level settings
function initializeLevel() {
  positionFleet();
  playerCenterX = canvas.width / 2;
  playerCenterY = canvas.height - PLAYER_BOT_MARGIN;
  bullets = [];
  enemyBullets = [];
  bulletCooldown = false;
  bulletTimer = BULLET_RATE;
  enemyVelocityX = 15; // Reset enemy velocity back to normal
}

// Umbrella Draw
function drawEverything() {
  colorRect(0, 0, canvas.width, canvas.height, 'white'); // black background
  drawFleet();
  drawPlayer();
  drawBullet();
  drawEnemyBullets();
  if (!gameStart) displayInstructions(); // displays instructions
  else {
    displayScore(); // displays score
    displayLives(); // displays lives
    displayLevel(); // displays level
    if (gameOver) displayGameOver(); // displays game over message
  }
}

// Draw Enemy Fleet
function drawFleet() {
  // Draws individual enemies
  for (let key in enemyFleet) {
    let enemyPos = enemyFleet[key];
    if (level === 1) {
      // Draw level 1 invaders using the image
      canvasContext.drawImage(level1InvadersImage, enemyPos[0], enemyPos[1], ENEMY_WIDTH, ENEMY_HEIGHT);
    } else {
      // Draw other level invaders using emojis
      drawEmoji(enemyPos[0], enemyPos[1], ENEMY_COLOR, enemyEmojis[level - 1]);
    }
  }
}

// Draw Player
function drawPlayer() {
  drawEmoji(playerCenterX, playerCenterY, PLAYER_COLOR, '😇'); // Player is an angel emoji
}

// Draw Bullet
function drawBullet() {
  for (let bullet of bullets) {
    drawEmoji(bullet[0], bullet[1], 'black', BULLET_EMOJI); // Bullet is a lightning bolt emoji
  }
}

// Draw Enemy Bullets
function drawEnemyBullets() {
  for (let bullet of enemyBullets) {
    drawEmoji(bullet[0], bullet[1], 'red', '⛧'); // Draw enemy bullets as lightning bolt emojis
  }
}

// Display Instructions
function displayInstructions() {
  canvasContext.font = '20px Arial';
  canvasContext.textAlign = 'center';
  canvasContext.fillStyle = 'white';
  canvasContext.fillText(INSTRUCTIONS, canvas.width / 2, 500);
}

// Display Game Over Message
function displayGameOver() {
  canvasContext.font = '35px Arial';
  canvasContext.textAlign = 'center';
  canvasContext.fillStyle = GAME_OVER_COLOR;
  canvasContext.fillText(GAME_OVER, canvas.width / 2, canvas.height / 2);
}

// Display Score
function displayScore() {
  canvasContext.font = '20px Arial';
  canvasContext.textAlign = 'center';
  canvasContext.fillStyle = SCORE_COLOR;
  canvasContext.fillText('Score: ' + score, canvas.width / 2, 50);
}

// Display Lives
function displayLives() {
  canvasContext.font = '20px Arial';
  canvasContext.textAlign = 'center';
  canvasContext.fillStyle = SCORE_COLOR;
  canvasContext.fillText('Lives: ' + lives, canvas.width / 2, 80);
}

// Display Level
function displayLevel() {
  canvasContext.font = '20px Arial';
  canvasContext.textAlign = 'center';
  canvasContext.fillStyle = SCORE_COLOR;
  canvasContext.fillText('Level: ' + level, canvas.width / 2, 20);
}

// Draw Emoji
function drawEmoji(x, y, color, emoji) {
  canvasContext.font = '40px Arial'; // Adjusted font size for emojis
  canvasContext.textAlign = 'center';
  canvasContext.fillStyle = color;
  canvasContext.fillText(emoji, x, y);
}

// Draw Rectangle
function colorRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX, topY, width, height);
}

// Enemy Fire Function
function enemyFire() {
  // Ensure there is at least one enemy left
  if (Object.keys(enemyFleet).length > 0) {
    // Fire a random enemy bullet every 750ms
    if (enemyBulletTimer >= 750) {
      const randomEnemyIndex = Math.floor(Math.random() * Object.keys(enemyFleet).length);
      const enemyKey = Object.keys(enemyFleet)[randomEnemyIndex];
      const enemyPosition = enemyFleet[enemyKey];
      enemyBullets.push([enemyPosition[0], enemyPosition[1] + ENEMY_HEIGHT / 2]);
      enemyBulletTimer = 0; // Reset enemy bullet timer
    }
  }
}
