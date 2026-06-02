// Breakout Game (Brick Breaker)
class BreakoutGame {
  constructor(canvasId, scoreId, levelId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    this.levelEl = document.getElementById(levelId);
    
    this.paddle = { x: this.canvas.width / 2 - 40, y: this.canvas.height - 20, width: 80, height: 10 };
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height - 40, radius: 5, vx: 3, vy: -3 };
    this.score = 0;
    this.level = 1;
    this.gameActive = false;
    this.gamePaused = false;
    this.gameLoop = null;
    
    this.createBricks();
    this.setupControls();
  }
  
  createBricks() {
    this.bricks = [];
    const cols = 5;
    const rows = 3 + this.level;
    const brickWidth = this.canvas.width / cols - 4;
    const brickHeight = 15;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: c * (brickWidth + 4) + 2,
          y: r * (brickHeight + 4) + 30,
          width: brickWidth,
          height: brickHeight,
          active: true
        });
      }
    }
  }
  
  setupControls() {
    document.addEventListener('mousemove', (e) => {
      if (!this.gameActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
    });
    
    document.addEventListener('keydown', (e) => {
      if (!this.gameActive) return;
      if (e.key.toLowerCase() === 'a') {
        this.paddle.x = Math.max(0, this.paddle.x - 20);
      } else if (e.key.toLowerCase() === 'd') {
        this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + 20);
      }
    });
  }
  
  start() {
    if (this.gameActive) return;
    this.gameActive = true;
    this.gamePaused = false;
    this.score = 0;
    this.level = 1;
    this.scoreEl.textContent = '0';
    this.levelEl.textContent = '1';
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height - 40, radius: 5, vx: 3, vy: -3 };
    this.createBricks();
    this.gameLoop = setInterval(() => this.update(), 50);
  }
  
  togglePause() {
    if (!this.gameActive) return;
    this.gamePaused = !this.gamePaused;
    document.getElementById('breakoutPause').textContent = this.gamePaused ? 'Resume' : 'Pause';
  }
  
  stop() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    document.getElementById('breakoutPause').textContent = 'Pause';
  }
  
  update() {
    if (!this.gamePaused && this.gameActive) {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      
      if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.canvas.width) {
        this.ball.vx *= -1;
        this.ball.x = Math.max(this.ball.radius, Math.min(this.canvas.width - this.ball.radius, this.ball.x));
      }
      
      if (this.ball.y - this.ball.radius < 0) {
        this.ball.vy *= -1;
      }
      
      if (this.ball.y + this.ball.radius > this.canvas.height) {
        this.gameOver();
        return;
      }
      
      if (this.ball.y + this.ball.radius > this.paddle.y &&
          this.ball.x > this.paddle.x &&
          this.ball.x < this.paddle.x + this.paddle.width) {
        this.ball.vy *= -1;
        this.ball.y = this.paddle.y - this.ball.radius;
      }
      
      for (let brick of this.bricks) {
        if (brick.active && this.isColliding(this.ball, brick)) {
          brick.active = false;
          this.score += 10;
          this.scoreEl.textContent = this.score;
          this.ball.vy *= -1;
        }
      }
      
      const activeBricks = this.bricks.filter(b => b.active).length;
      if (activeBricks === 0) {
        this.nextLevel();
      }
    }
    this.draw();
  }
  
  isColliding(ball, brick) {
    return ball.x + ball.radius > brick.x &&
           ball.x - ball.radius < brick.x + brick.width &&
           ball.y + ball.radius > brick.y &&
           ball.y - ball.radius < brick.y + brick.height;
  }
  
  draw() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.bricks.forEach(brick => {
      if (brick.active) {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
  }
  
  nextLevel() {
    this.level++;
    this.levelEl.textContent = this.level;
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height - 40, radius: 5, vx: 3, vy: -3 };
    this.createBricks();
  }
  
  gameOver() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    alert(`Game Over! Score: ${this.score} | Level: ${this.level}`);
    document.getElementById('breakoutPause').textContent = 'Pause';
  }
}
