// Pong Game (2-Player)
export class PongGame {
  constructor(canvasId, p1ScoreId, p2ScoreId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.p1ScoreEl = document.getElementById(p1ScoreId);
    this.p2ScoreEl = document.getElementById(p2ScoreId);
    
    this.p1 = { x: 10, y: this.canvas.height / 2 - 40, width: 10, height: 80, score: 0, dy: 0 };
    this.p2 = { x: this.canvas.width - 20, y: this.canvas.height / 2 - 40, width: 10, height: 80, score: 0, dy: 0 };
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height / 2, radius: 5, vx: 4, vy: 4 };
    
    this.gameActive = false;
    this.gamePaused = false;
    this.gameLoop = null;
    this.keys = {};
    
    this.setupControls();
  }
  
  setupControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  start() {
    if (this.gameActive) return;
    this.gameActive = true;
    this.gamePaused = false;
    this.p1.score = 0;
    this.p2.score = 0;
    this.p1ScoreEl.textContent = '0';
    this.p2ScoreEl.textContent = '0';
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height / 2, radius: 5, vx: 4, vy: 4 };
    this.gameLoop = setInterval(() => this.update(), 30);
  }
  
  togglePause() {
    if (!this.gameActive) return;
    this.gamePaused = !this.gamePaused;
    document.getElementById('pongPause').textContent = this.gamePaused ? 'Resume' : 'Pause';
  }
  
  stop() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    document.getElementById('pongPause').textContent = 'Pause';
  }
  
  update() {
    if (!this.gamePaused && this.gameActive) {
      // Player 1 controls (W/S)
      if (this.keys['w']) {
        this.p1.y = Math.max(0, this.p1.y - 6);
      }
      if (this.keys['s']) {
        this.p1.y = Math.min(this.canvas.height - this.p1.height, this.p1.y + 6);
      }
      
      // Player 2 controls (Arrow Up/Down)
      if (this.keys['arrowup']) {
        this.p2.y = Math.max(0, this.p2.y - 6);
      }
      if (this.keys['arrowdown']) {
        this.p2.y = Math.min(this.canvas.height - this.p2.height, this.p2.y + 6);
      }
      
      // Ball movement
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      
      // Ball collision with top/bottom
      if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
        this.ball.vy *= -1;
        this.ball.y = Math.max(this.ball.radius, Math.min(this.canvas.height - this.ball.radius, this.ball.y));
      }
      
      // Ball collision with paddles
      if (this.ball.x - this.ball.radius < this.p1.x + this.p1.width &&
          this.ball.y > this.p1.y &&
          this.ball.y < this.p1.y + this.p1.height) {
        this.ball.vx *= -1;
        this.ball.x = this.p1.x + this.p1.width + this.ball.radius;
      }
      
      if (this.ball.x + this.ball.radius > this.p2.x &&
          this.ball.y > this.p2.y &&
          this.ball.y < this.p2.y + this.p2.height) {
        this.ball.vx *= -1;
        this.ball.x = this.p2.x - this.ball.radius;
      }
      
      // Scoring
      if (this.ball.x < 0) {
        this.p2.score++;
        this.p2ScoreEl.textContent = this.p2.score;
        this.resetBall();
      }
      if (this.ball.x > this.canvas.width) {
        this.p1.score++;
        this.p1ScoreEl.textContent = this.p1.score;
        this.resetBall();
      }
      
      // Check win condition
      if (this.p1.score >= 5 || this.p2.score >= 5) {
        this.gameOver();
      }
    }
    this.draw();
  }
  
  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.ball.vy = (Math.random() - 0.5) * 6;
  }
  
  draw() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Center line
    this.ctx.strokeStyle = '#444';
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Paddles
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(this.p1.x, this.p1.y, this.p1.width, this.p1.height);
    
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.fillRect(this.p2.x, this.p2.y, this.p2.width, this.p2.height);
    
    // Ball
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  gameOver() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    const winner = this.p1.score >= 5 ? 'Player 1' : 'Player 2';
    alert(`🎉 ${winner} Wins!\nP1: ${this.p1.score} | P2: ${this.p2.score}`);
    document.getElementById('pongPause').textContent = 'Pause';
  }
}
