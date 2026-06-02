// Snake Game
class SnakeGame {
  constructor(canvasId, scoreId, highScoreId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    this.highScoreEl = document.getElementById(highScoreId);
    
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;
    this.snake = [{ x: 10, y: 10 }];
    this.food = { x: 15, y: 15 };
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameActive = false;
    this.gamePaused = false;
    this.gameLoop = null;
    
    this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    this.highScoreEl.textContent = this.highScore;
    
    this.setupControls();
  }
  
  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameActive) return;
      
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
        e.preventDefault();
      } else if (key === 'arrowdown' || key === 's') {
        if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
        e.preventDefault();
      } else if (key === 'arrowleft' || key === 'a') {
        if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
        e.preventDefault();
      } else if (key === 'arrowright' || key === 'd') {
        if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
        e.preventDefault();
      }
    });
  }
  
  start() {
    if (this.gameActive) return;
    this.gameActive = true;
    this.gamePaused = false;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.scoreEl.textContent = '0';
    this.spawnFood();
    this.gameLoop = setInterval(() => this.update(), 100);
  }
  
  togglePause() {
    if (!this.gameActive) return;
    this.gamePaused = !this.gamePaused;
    document.getElementById('snakePause').textContent = this.gamePaused ? 'Resume' : 'Pause';
  }
  
  stop() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    document.getElementById('snakePause').textContent = 'Pause';
  }
  
  update() {
    if (!this.gamePaused && this.gameActive) {
      this.direction = this.nextDirection;
      const head = this.snake[0];
      const newHead = {
        x: (head.x + this.direction.x + this.tileCount) % this.tileCount,
        y: (head.y + this.direction.y + this.tileCount) % this.tileCount
      };
      
      if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        this.gameOver();
        return;
      }
      
      this.snake.unshift(newHead);
      
      if (newHead.x === this.food.x && newHead.y === this.food.y) {
        this.score += 10;
        this.scoreEl.textContent = this.score;
        this.spawnFood();
      } else {
        this.snake.pop();
      }
    }
    this.draw();
  }
  
  spawnFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
    } while (this.snake.some(seg => seg.x === food.x && seg.y === food.y));
    this.food = food;
  }
  
  draw() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff00';
    this.snake.forEach((seg, idx) => {
      if (idx === 0) this.ctx.fillStyle = '#ffff00';
      this.ctx.fillRect(
        seg.x * this.gridSize + 1,
        seg.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
      this.ctx.fillStyle = '#00ff00';
    });
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(
      this.food.x * this.gridSize + 1,
      this.food.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }
  
  gameOver() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore);
      this.highScoreEl.textContent = this.highScore;
      alert(`🎉 New High Score: ${this.score}!`);
    } else {
      alert(`Game Over! Score: ${this.score}`);
    }
    document.getElementById('snakePause').textContent = 'Pause';
  }
}
