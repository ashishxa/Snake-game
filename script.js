const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameRunning;
let gameSpeed;
let gameLoop;

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.textContent = highScore;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    gameSpeed = 120;
    gameRunning = true;

    scoreElement.textContent = score;
    gameOverScreen.style.display = "none";

    createFood();

    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, gameSpeed);

    drawGame();
}

function drawGame() {
    // Background
    ctx.fillStyle = "#06100d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Food
    drawFood();

    // Snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#8affc1" : "#45ff9a";

        roundRect(
            ctx,
            part.x * gridSize + 2,
            part.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4,
            6
        );

        // Eyes
        if (index === 0) {
            ctx.fillStyle = "#06100d";

            let eye1;
            let eye2;

            if (direction.x === 1) {
                eye1 = [part.x * gridSize + 14, part.y * gridSize + 6];
                eye2 = [part.x * gridSize + 14, part.y * gridSize + 14];
            } else if (direction.x === -1) {
                eye1 = [part.x * gridSize + 6, part.y * gridSize + 6];
                eye2 = [part.x * gridSize + 6, part.y * gridSize + 14];
            } else if (direction.y === -1) {
                eye1 = [part.x * gridSize + 6, part.y * gridSize + 6];
                eye2 = [part.x * gridSize + 14, part.y * gridSize + 6];
            } else {
                eye1 = [part.x * gridSize + 6, part.y * gridSize + 14];
                eye2 = [part.x * gridSize + 14, part.y * gridSize + 14];
            }

            ctx.beginPath();
            ctx.arc(eye1[0], eye1[1], 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eye2[0], eye2[1], 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawFood() {
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;

    ctx.fillStyle = "#ff5c7a";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff5c7a";

    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}

function updateGame() {
    if (!gameRunning) return;

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Wall collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        endGame();
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            highScoreElement.textContent = highScore;
        }

        createFood();

        // Speed increases every 5 points
        if (score % 5 === 0 && gameSpeed > 55) {
            gameSpeed -= 10;

            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    } else {
        snake.pop();
    }

    drawGame();
}

function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(
            part => part.x === newFood.x && part.y === newFood.y
        )
    );

    food = newFood;
}

function changeDirection(dir) {
    if (!gameRunning) return;

    if (dir === "up" && direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
    }

    if (dir === "down" && direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
    }

    if (dir === "left" && direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
    }

    if (dir === "right" && direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
    }
}

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (["arrowup", "w"].includes(key)) {
        changeDirection("up");
    }

    if (["arrowdown", "s"].includes(key)) {
        changeDirection("down");
    }

    if (["arrowleft", "a"].includes(key)) {
        changeDirection("left");
    }

    if (["arrowright", "d"].includes(key)) {
        changeDirection("right");
    }

    if (key === "enter" && !gameRunning) {
        restartGame();
    }
});

function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);

    finalScore.textContent = score;
    gameOverScreen.style.display = "block";
}

function restartGame() {
    initGame();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );

    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );

    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );

    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );

    ctx.closePath();
    ctx.fill();
}

initGame();