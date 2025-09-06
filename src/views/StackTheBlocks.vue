<template>
  <div class="game-wrapper" ref="gameWrapper">
    <div class="back-button" @click="$router.push('/')">Back</div>
    <h1 class="title">Stack The Blocks</h1>
    <div class="game-container">
      <canvas ref="canvas" width="400" height="450"></canvas>
      <div v-if="gameOver" class="overlay">
        <h2>Game Over!</h2>
        <p>Your Score: {{ score }}</p>

        <input
          v-model="roll"
          placeholder="Enter Roll Number"
          class="roll-input"
        />
        <button @click="submitScore">Submit Score</button>
        <button @click="startGame">Restart</button>
      </div>
    </div>
    <div class="controls">
      <p>Score: <span class="score">{{ score }}</span></p>
      <p class="instructions">Space / Click / Tap to Stack</p>
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
      speed: 150,
      direction: 1,
      currentX: 0,
      currentWidth: 0,
      currentY: 0,
      score: 0,
      gameOver: false,
      gameLoop: null,
      cameraOffset: 0,
      roll: "",
      snakeScore: 0,
      flappyScore: 0,
      lastTime: null,
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.startGame();

    // Prevent scroll while playing
    const wrapper = this.$refs.gameWrapper;
    if (wrapper) {
      // Prevent scroll on swipe
      wrapper.addEventListener(
        "touchmove",
        function (e) {
          e.preventDefault();
        },
        { passive: false }
      );

      // Tap to place block and prevent scroll
      wrapper.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault(); // 🚀 stop scroll
          this.placeBlock();
        },
        { passive: false }
      );
    }

    // keyboard
    window.addEventListener("keydown", this.handleKey);

    // 🔑 allow tapping/clicking anywhere on screen
    window.addEventListener("click", this.placeBlock);
    // window.addEventListener("touchstart", this.placeBlock, { passive: true });
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKey);
    const wrapper = this.$refs.gameWrapper;
    if (wrapper) {
      wrapper.removeEventListener("touchmove", function (e) { e.preventDefault(); });
      wrapper.removeEventListener("touchstart", this.placeBlock);
    }
  },
  methods: {
    startGame() {
      const canvas = this.$refs.canvas;

      this.blocks = [{ x: 100, y: 420, width: 200 }];
      this.score = 0;
      this.currentWidth = 200;

      // FIX 1: Start at canvas center instead of left edge
      this.currentX = canvas.width / 2 - this.currentWidth / 2;
      this.currentY = 420 - this.blockHeight;
      this.direction = 1;
      this.gameOver = false;
      this.cameraOffset = 0;
      this.lastTime = performance.now();

      if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
      this.gameLoop = requestAnimationFrame((time) => this.update(time));
    },
    handleKey(e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
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

      this.speed = 150 + Math.floor(this.score / 5) * 20;

      if (this.currentY - this.cameraOffset < 100) {
        this.cameraOffset += this.blockHeight;
      }
    },
    update(time) {
      const ctx = this.ctx;
      const canvas = this.$refs.canvas;

      let deltaTime = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // FIX 2: Clamp abnormal delta times
      if (deltaTime > 0.05) deltaTime = 0.016;

      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, this.cameraOffset);

      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ff0000";
      this.blocks.forEach((block) => {
        ctx.fillStyle = "red";
        ctx.fillRect(block.x, block.y, block.width, this.blockHeight);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(block.x, block.y, block.width, this.blockHeight);
      });

      this.currentX += this.speed * this.direction * deltaTime;
      if (this.currentX + this.currentWidth > canvas.width || this.currentX < 0) {
        this.direction *= -1;
        // Prevent it from "sticking" outside
        this.currentX = Math.max(
          0,
          Math.min(this.currentX, canvas.width - this.currentWidth)
        );
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
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
      }
    },
    endGame() {
      this.gameOver = true;
      cancelAnimationFrame(this.gameLoop);
    },
    async submitScore() {
      if (!this.roll) {
        alert("Please enter Roll No");
        return;
      }
      const rollRegex = /^2[0-9]{3}[a-zA-Z]{2}[0-9]{2}$/;
      if (!rollRegex.test(this.roll)) {
        alert("Invalid Roll Number format. Example: 2101CS01");
        return;
      }

      try {
        await fetch("https://script.google.com/macros/s/AKfycbyZERpdFBcjiPbUlzOfhMjuQUAFzxjDWWKaCD9jwbsKexbE8cBto2CSgPT3nrcvJy14ew/exec", {
          method: "POST",
          body: new URLSearchParams({
            action: "upsert",
            roll: this.roll,
            snakeScore: this.snakeScore,
            flappyScore: this.flappyScore,
            stackScore: this.score,
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

.game-wrapper { display:flex; flex-direction:column; align-items:center; font-family:"Press Start 2P", monospace; color:#fff; background:linear-gradient(160deg, #000, #1a0000); min-height:100vh; padding:20px; overflow:hidden; }
.title { color:#ff1a1a; margin-bottom:20px; letter-spacing:2px; text-align:center; }
.game-container { position:relative; margin-bottom:15px; }
canvas { border:3px solid #660000; box-shadow:0 0 10px rgba(255,0,0,0.6); border-radius:8px; max-width:100%; height:auto; }
.controls { text-align:center; }
.score { color:#ff1a1a; font-weight:bold; }
.instructions { color:#cccccc; font-size:10px; margin-top:10px; text-shadow:0 0 4px #666666; }
button { background:#b30000; color:white; font-family:inherit; border:none; padding:10px 20px; margin-top:8px; border-radius:6px; cursor:pointer; box-shadow:0 0 10px rgba(255,0,0,0.7); transition:0.2s; font-size:12px; }
button:hover { background:#cc0000; transform:scale(1.05); }
.overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(20,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius:8px; }
.overlay h2 { color:#ff3333; margin-bottom:10px; }
.roll-input { margin:8px 0; padding:6px; border-radius:4px; border:none; font-family:inherit; text-align:center; color:#fff; background:#330000; outline:none; caret-color:#ff1a1a; } .game-wrapper {
  touch-action: none;  /* 🚀 prevent gestures/scroll inside wrapper */
}

canvas {
  touch-action: none;  /* 🚀 prevent pinch-zoom & scroll on canvas */
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #b30000;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
  transition: 0.2s;
  z-index: 10;
}

.back-button:hover {
  background: #cc0000;
  transform: scale(1.05);
}
@media(max-width: 767px) {
  .game-wrapper {
    padding-top: 60px;
  }
}
</style>
