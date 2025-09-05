<template>
  <div class="game-wrapper" ref="gameWrapper">
    <h1 class="title">Flappy Bird</h1>
    <div class="game-container">
      <canvas ref="canvas" width="400" height="450"></canvas>
      <div v-if="gameOver" class="overlay">
        <h2>Game Over!</h2>
        <p>Your Score: {{ score }}</p>

        <input
          v-model="roll"
          placeholder="Enter Roll No"
          class="roll-input"
        />
        <button @click="submitScore">Submit Score</button>
        <button @click="startGame">Restart</button>
      </div>
    </div>

    <div class="controls">
      <p>Score: <span class="score">{{ score }}</span></p>
      <p class="instructions">Space / Click / Tap to Flap</p>
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
      score: 0,
      gameOver: false,
      gameLoop: null,
      roll: "",
      snakeScore: 0,
      stackScore: 0,
      lastTime: null,   // for delta time
      pipeTimer: 0,     // ms since last pipe
      pipeInterval: 1500, // ms between pipes
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
      this.score = 0;
      this.gameOver = false;
      this.lastTime = null;
      this.pipeTimer = 0;

      // 🟢 Spawn first pipe immediately
      const canvas = this.$refs.canvas;
      let topHeight = Math.random() * (canvas.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + this.pipeGap,
        passed: false,
      });

      if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
      this.gameLoop = requestAnimationFrame(this.update.bind(this));
    },
    flap() {
      if (!this.gameOver) {
        this.bird.velocity = this.jump;
      }
    },
    handleKey(e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        this.flap();
      }
    },
    update(timestamp) {
      if (!this.lastTime) this.lastTime = timestamp;
      const deltaMs = timestamp - this.lastTime;
      const delta = deltaMs / 16.67; // relative to 60fps
      this.lastTime = timestamp;

      const ctx = this.ctx;
      const canvas = this.$refs.canvas;

      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bird physics
      this.bird.velocity += this.gravity * delta;
      this.bird.y += this.bird.velocity * delta;

      // Draw bird
      ctx.beginPath();
      ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff1a1a";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pipe spawning (time-based)
      this.pipeTimer += deltaMs;
      if (this.pipeTimer > this.pipeInterval) {
        let topHeight = Math.random() * (canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
          x: canvas.width,
          top: topHeight,
          bottom: topHeight + this.pipeGap,
          passed: false,
        });
        this.pipeTimer = 0;
      }

      // Update and draw pipes
      this.pipes.forEach((pipe) => {
        pipe.x -= 2 * delta;

        ctx.fillStyle = "#cc0000";
        ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, this.pipeWidth, canvas.height - pipe.bottom);

        ctx.strokeStyle = "#ff4d4d";
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.top);
        ctx.strokeRect(pipe.x, pipe.bottom, this.pipeWidth, canvas.height - pipe.bottom);

        // Collision
        if (
          this.bird.x + this.bird.radius > pipe.x &&
          this.bird.x - this.bird.radius < pipe.x + this.pipeWidth &&
          (this.bird.y - this.bird.radius < pipe.top ||
            this.bird.y + this.bird.radius > pipe.bottom)
        ) {
          this.endGame();
        }

        // Score
        if (pipe.x + this.pipeWidth < this.bird.x && !pipe.passed) {
          this.score++;
          pipe.passed = true;
        }
      });

      this.pipes = this.pipes.filter((pipe) => pipe.x + this.pipeWidth > 0);

      // Ground / ceiling collision
      if (
        this.bird.y + this.bird.radius >= canvas.height ||
        this.bird.y - this.bird.radius <= 0
      ) {
        this.endGame();
      }

      if (!this.gameOver) this.gameLoop = requestAnimationFrame(this.update.bind(this));
    },
    endGame() {
      this.gameOver = true;
      cancelAnimationFrame(this.gameLoop);
    },
    async submitScore() {
      if (!this.roll) {
        alert("Please enter Roll Number");
        return;
      }

      try {
        await fetch("https://script.google.com/macros/s/AKfycbyZERpdFBcjiPbUlzOfhMjuQUAFzxjDWWKaCD9jwbsKexbE8cBto2CSgPT3nrcvJy14ew/exec", {
          method: "POST",
          body: new URLSearchParams({
            action: "upsert",
            roll: this.roll,
            snakeScore: this.snakeScore,
            flappyScore: this.score,
            stackScore: this.stackScore
          }),
        });
        alert("Score submitted!");
      } catch (err) {
        console.error(err);
        alert("Error submitting score");
      }
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
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
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
  margin-bottom: 10px;
}

.roll-input {
  margin: 8px 0;
  padding: 6px;
  border-radius: 4px;
  border: none;
  font-family: inherit;
  text-align: center;
  color: #fff;
  background: #330000;
  outline: none;
  caret-color: #ff1a1a;
}
</style>
