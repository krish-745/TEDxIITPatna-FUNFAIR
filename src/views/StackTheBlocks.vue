<template>
  <div class="game-wrapper">
    <h1 class="title">🏗️ Stack The Blocks</h1>
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
      <p class="instructions">Space/Click to Stack</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "StackBlocks",
  data() {
    return {
      ctx: null,
      blocks: [],
      blockHeight: 30,
      speed: 3,
      direction: 1,
      currentX: 0,
      currentWidth: 0,
      currentY: 0,
      score: 0,
      gameOver: false,
      gameLoop: null,
      cameraOffset: 0,
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.startGame();

    window.addEventListener("keydown", this.handleKey);
    canvas.addEventListener("click", this.placeBlock);
    canvas.addEventListener("touchstart", this.placeBlock);
  },
  methods: {
    startGame() {
      this.blocks = [{ x: 100, y: 420, width: 200 }]; // base block (adjusted for shorter canvas)
      this.score = 0;
      this.speed = 3;
      this.currentWidth = 200;
      this.currentX = 0;
      this.currentY = 420 - this.blockHeight; // adjusted for shorter canvas
      this.direction = 1;
      this.gameOver = false;
      this.cameraOffset = 0;
      if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
      this.update();
    },
    handleKey(e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault(); // Prevent page scrolling
        this.placeBlock();
      }
    },
    placeBlock() {
      if (this.gameOver) return;

      const prevBlock = this.blocks[this.blocks.length - 1];
      const overlap =
        Math.min(this.currentX + this.currentWidth, prevBlock.x + prevBlock.width) -
        Math.max(this.currentX, prevBlock.x);

      if (overlap <= 0) {
        this.endGame();
        return;
      }

      const newWidth = overlap;
      const newX = Math.max(this.currentX, prevBlock.x);

      this.blocks.push({ x: newX, y: this.currentY, width: newWidth });

      this.score++;
      this.currentWidth = newWidth;
      this.currentY -= this.blockHeight;

      this.speed = 3 + Math.floor(this.score / 5);

      if (this.currentY - this.cameraOffset < 100) {
        this.cameraOffset += this.blockHeight;
      }
    },
    update() {
      const ctx = this.ctx;
      const canvas = this.$refs.canvas;
      
      // Dark background
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, this.cameraOffset);

      // Draw stacked blocks with glow effect
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ff0000";
      this.blocks.forEach((block, index) => {
        // Gradient effect for stacked blocks
        ctx.fillStyle = 'red';
        ctx.fillRect(block.x, block.y, block.width, this.blockHeight);
        
        // Border for definition
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(block.x, block.y, block.width, this.blockHeight);
      });

      // Moving block with different glow
      this.currentX += this.speed * this.direction;
      if (this.currentX + this.currentWidth > canvas.width || this.currentX < 0) {
        this.direction *= -1;
      }

      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#999999";
      ctx.fillRect(this.currentX, this.currentY, this.currentWidth, this.blockHeight);
      
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.currentX, this.currentY, this.currentWidth, this.blockHeight);
      
      ctx.shadowBlur = 0;
      ctx.restore();

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