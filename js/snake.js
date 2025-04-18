document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  
  // Настройки игры
  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  let speed = 7;
  let lastRenderTime = 0;
  let gameOver = false;
  
  // Состояние игры
  let snake = [];
  let food = {};
  let direction = 'right';
  let nextDirection = 'right';
  let score = 0;
  let gameRunning = false;
  let gamePaused = false;
  let animationId;
  
  // Цвета
  const colors = {
    snake: '#16a085',
    snakeHead: '#1abc9c',
    food: '#e74c3c',
    grid: 'rgba(22, 160, 133, 0.2)',
    background: '#2ecc71',
    border: '#16a085'
  };
  
  // Инициализация игры
  function initGame() {
    snake = [
      {x: 5, y: 10},
      {x: 4, y: 10},
      {x: 3, y: 10}
    ];
    
    generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    speed = 7;
    gameOver = false;
    updateScore();
  }
  
  // Генерация еды
  function generateFood() {
    const availableCells = [];
    
    // Создаем массив всех возможных клеток
    for (let x = 0; x < tileCount; x++) {
      for (let y = 0; y < tileCount; y++) {
        let isSnake = false;
        
        // Проверяем, не занята ли клетка змейкой
        for (const segment of snake) {
          if (segment.x === x && segment.y === y) {
            isSnake = true;
            break;
          }
        }
        
        if (!isSnake) availableCells.push({x, y});
      }
    }
    
    // Выбираем случайную свободную клетку
    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      food = availableCells[randomIndex];
    } else {
      // Если нет свободных клеток (победа)
      victory();
    }
  }
  
  // Основной игровой цикл (оптимизированный с requestAnimationFrame)
  function gameLoop(currentTime) {
    if (gamePaused || gameOver) {
      animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / speed) {
      animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    lastRenderTime = currentTime;
    
    update();
    draw();
    
    animationId = requestAnimationFrame(gameLoop);
  }
  
  // Обновление состояния игры
  function update() {
    // Обновляем направление
    direction = nextDirection;
    
    // Перемещаем змейку
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch (direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }
    
    // Проверка столкновения с границами
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame();
      return;
    }
    
    // Проверка столкновения с собой
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        endGame();
        return;
      }
    }
    
    // Добавляем новую голову
    snake.unshift(head);
    
    // Проверка съедания еды
    if (head.x === food.x && head.y === food.y) {
      score++;
      updateScore();
      generateFood();
      
      // Увеличиваем скорость каждые 5 очков
      if (score % 5 === 0) {
        speed += 0.5;
      }
    } else {
      // Удаляем хвост, если не съели еду
      snake.pop();
    }
  }
  
  // Отрисовка игры
  function draw() {
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сетку
    drawGrid();
    
    // Рисуем змейку
    drawSnake();
    
    // Рисуем еду
    drawFood();
  }
  
  // Рисование сетки
  function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    
    // Вертикальные линии
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Горизонтальные линии
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
  
  // Рисование змейки
  function drawSnake() {
    // Тело змейки
    ctx.fillStyle = colors.snake;
    for (let i = 1; i < snake.length; i++) {
      ctx.fillRect(
        snake[i].x * gridSize, 
        snake[i].y * gridSize, 
        gridSize, 
        gridSize
      );
      
      // Скругленные углы
      ctx.strokeStyle = colors.snake;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        snake[i].x * gridSize + 1, 
        snake[i].y * gridSize + 1, 
        gridSize - 2, 
        gridSize - 2
      );
    }
    
    // Голова змейки
    ctx.fillStyle = colors.snakeHead;
    ctx.fillRect(
      snake[0].x * gridSize, 
      snake[0].y * gridSize, 
      gridSize, 
      gridSize
    );
    
    // Глаза змейки
    ctx.fillStyle = 'white';
    const eyeSize = 3;
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
    
    switch (direction) {
      case 'up':
        leftEyeX = snake[0].x * gridSize + 4;
        leftEyeY = snake[0].y * gridSize + 4;
        rightEyeX = snake[0].x * gridSize + 12;
        rightEyeY = snake[0].y * gridSize + 4;
        break;
      case 'down':
        leftEyeX = snake[0].x * gridSize + 4;
        leftEyeY = snake[0].y * gridSize + 12;
        rightEyeX = snake[0].x * gridSize + 12;
        rightEyeY = snake[0].y * gridSize + 12;
        break;
      case 'left':
        leftEyeX = snake[0].x * gridSize + 4;
        leftEyeY = snake[0].y * gridSize + 4;
        rightEyeX = snake[0].x * gridSize + 4;
        rightEyeY = snake[0].y * gridSize + 12;
        break;
      case 'right':
        leftEyeX = snake[0].x * gridSize + 12;
        leftEyeY = snake[0].y * gridSize + 4;
        rightEyeX = snake[0].x * gridSize + 12;
        rightEyeY = snake[0].y * gridSize + 12;
        break;
    }
    
    ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
    ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
  }
  
  // Рисование еды
  function drawFood() {
    ctx.fillStyle = colors.food;
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Эффект блика на еде
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2 + 2,
      food.y * gridSize + gridSize / 2 - 2,
      gridSize / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Обновление счета
  function updateScore() {
    scoreElement.textContent = score;
  }
  
  // Конец игры
  function endGame() {
    gameOver = true;
    gameRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Пауза';
    
    // Анимация проигрыша
    drawGameOver();
    
    setTimeout(() => {
      alert(`Игра окончена! Ваш счет: ${score}`);
    }, 100);
  }
  
  // Победа (заполнено все поле)
  function victory() {
    gameOver = true;
    gameRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    alert(`Победа! Вы заполнили все поле! Финальный счет: ${score}`);
  }
  
  // Анимация конца игры
  function drawGameOver() {
    ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2);
  }
  
  // Старт игры
  function startGame() {
    if (gameRunning) return;
    
    initGame();
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    lastRenderTime = 0;
    animationId = requestAnimationFrame(gameLoop);
  }
  
  // Пауза игры
  function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Продолжить' : 'Пауза';
    
    if (!gamePaused) {
      lastRenderTime = 0;
    }
  }
  
  // Обработка клавиш
  function handleKeyDown(e) {
    if (!gameRunning || gameOver) return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction !== 'down') nextDirection = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction !== 'up') nextDirection = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction !== 'right') nextDirection = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction !== 'left') nextDirection = 'right';
        break;
      case ' ':
        togglePause();
        break;
    }
  }
  
  // Назначение обработчиков событий
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);
  document.addEventListener('keydown', handleKeyDown);
  
  // Первоначальная отрисовка
  drawGrid();
});
