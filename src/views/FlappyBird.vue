<template>
  <div class="game-wrapper">
    <h1 class="title">🐦 Flappy Bird</h1>
    <div class="game-container">
      <canvas ref="canvas" width="400" height="450"></canvas>
      <div v-if="gameOver" class="overlay">
        <h2>Game Over!</h2>
        <p>Your Score: {{ score }}</p>
        <button @click="startGame">Restart</button>
      </div>
    </div>
    <div class="controls">
      <p>Score: <span class="score">{{ score }}</span></p>
      <p class="instructions">Space/Click to Flap</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "FlappyBird",
  data() {
    return {
      ctx: null,
      bird: { x: 80, y: 250, radius: 15, velocity: 0 },
      gravity: 0.5,
      jump: -5,
      pipes: [],
      pipeGap: 120,
      pipeWidth: 60,
      frame: 0,
      score: 0,
      gameOver: false,
      gameLoop: null,
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.startGame();

    window.addEventListener("keydown", this.handleKey);
    canvas.addEventListener("click", this.flap);
    canvas.addEventListener("touchstart", this.flap);
  },
  methods: {
    startGame() {
      this.bird = { x: 80, y: 250, radius: 15, velocity: 0 };
      this.pipes = [];
      this.frame = 0;
      this.score = 0;
      this.gameOver = false;

      if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
      this.update();
    },
    flap() {
      if (!this.gameOver) {
        this.bird.velocity = this.jump;
      }
    },
    handleKey(e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault(); // Prevent page scrolling
        this.flap();
      }
    },
    update() {
      const ctx = this.ctx;
      const canvas = this.$refs.canvas;

      // Dark background
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bird physics
      this.bird.velocity += this.gravity;
      this.bird.y += this.bird.velocity;

      // Draw bird with glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff0000";
      ctx.beginPath();
      ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff1a1a";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Pipes
      if (this.frame % 90 === 0) {
        let topHeight = Math.random() * (canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
          x: canvas.width,
          top: topHeight,
          bottom: topHeight + this.pipeGap,
        });
      }

      this.pipes.forEach((pipe) => {
        pipe.x -= 2;

        // Draw pipes with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#660000";
        ctx.fillStyle = "#cc0000";
        ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, this.pipeWidth, canvas.height - pipe.bottom);

        ctx.strokeStyle = "#ff4d4d";
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.top);
        ctx.strokeRect(pipe.x, pipe.bottom, this.pipeWidth, canvas.height - pipe.bottom);
        ctx.shadowBlur = 0;

        // Collision detection
        if (
          this.bird.x + this.bird.radius > pipe.x &&
          this.bird.x - this.bird.radius < pipe.x + this.pipeWidth &&
          (this.bird.y - this.bird.radius < pipe.top ||
            this.bird.y + this.bird.radius > pipe.bottom)
        ) {
          this.endGame();
        }

        if (pipe.x + this.pipeWidth === this.bird.x) {
          this.score++;
        }
      });

      this.pipes = this.pipes.filter((pipe) => pipe.x + this.pipeWidth > 0);

      // Ground and ceiling collision
      if (
        this.bird.y + this.bird.radius >= canvas.height ||
        this.bird.y - this.bird.radius <= 0
      ) {
        this.endGame();
      }

      this.frame++;
      if (!this.gameOver) {
        this.gameLoop = requestAnimationFrame(this.update);
      }
    },
    endGame() {
      this.gameOver = true;
      cancelAnimationFrame(this.gameLoop);
    },
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKey);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Press Start 2P", monospace, sans-serif;
  color: #fff;
  background: linear-gradient(160deg, #000, #1a0000);
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.title {
  color: #ff1a1a;
  text-shadow: 0 0 12px #ff0000, 0 0 24px #ff0000;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-align: center;
}

.game-container {
  position: relative;
  margin-bottom: 15px;
}

canvas {
  border: 3px solid #660000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
  border-radius: 8px;
  max-width: 100%;
  height: auto;
}

.controls {
  text-align: center;
}

.score {
  color: #ff1a1a;
  font-weight: bold;
  text-shadow: 0 0 8px #ff0000;
}

.instructions {
  color: #cccccc;
  font-size: 10px;
  margin-top: 10px;
  text-shadow: 0 0 4px #666666;
}

button {
  background: #b30000;
  color: white;
  font-family: inherit;
  border: none;
  padding: 10px 20px;
  margin-top: 8px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
  transition: 0.2s;
  font-size: 12px;
}

button:hover {
  background: #cc0000;
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(20, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.overlay h2 {
  color: #ff3333;
  text-shadow: 0 0 8px #ff0000;
  margin-bottom: 10px;
  font-size: 18px;
}

.overlay p {
  color: #ffffff;
  margin: 5px 0;
  font-size: 14px;
}
</style>