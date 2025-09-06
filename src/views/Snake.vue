<template>
  <div class="game-wrapper" ref="gameWrapper">
    <div class="back-button" @click="$router.push('/')">Back</div>
    <h1 class="title">Snake Game</h1>
    <div class="game-layout">
      <div class="game-container">
        <canvas ref="gameCanvas" :width="boardWidth" :height="boardHeight"></canvas>

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
    </div>

    <div class="controls">
      <p>Score: <span class="score">{{ score }}</span></p>
      <button @click="startGame" v-if="!gameStarted">Start Game</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SnakeGame",
  data() {
    return {
      ctx: null,
      snake: [{ x: 160, y: 160 }],
      direction: { x: 20, y: 0 },
      food: { x: 0, y: 0 },
      score: 0,
      boardWidth: 400,
      boardHeight: 400,
      tileSize: 20,
      gameInterval: null,
      gameOver: false,
      gameStarted: false,
      touchStartX: 0,
      touchStartY: 0,
      roll: "",
    };
  },
  methods: {
    startGame() {
      this.snake = [{ x: 160, y: 160 }];
      this.direction = { x: 20, y: 0 };
      this.score = 0;
      this.placeFood();
      this.gameOver = false;
      this.gameStarted = true;

      if (this.gameInterval) clearInterval(this.gameInterval);
      this.gameInterval = setInterval(this.gameLoop, 120);

      window.addEventListener("keydown", this.changeDirection);
    },
    gameLoop() {
      this.update();
      this.draw();
    },
    update() {
      const newHead = {
        x: this.snake[0].x + this.direction.x,
        y: this.snake[0].y + this.direction.y,
      };

      if (
        newHead.x < 0 ||
        newHead.y < 0 ||
        newHead.x >= this.boardWidth ||
        newHead.y >= this.boardHeight ||
        this.snake.some((s) => s.x === newHead.x && s.y === newHead.y)
      ) {
        this.endGame();
        return;
      }

      this.snake.unshift(newHead);

      if (newHead.x === this.food.x && newHead.y === this.food.y) {
        this.score++;
        this.placeFood();
      } else {
        this.snake.pop();
      }
    },
    draw() {
      this.ctx.fillStyle = "#0d0d0d";
      this.ctx.fillRect(0, 0, this.boardWidth, this.boardHeight);

      this.ctx.strokeStyle = "#2a0a0a";
      for (let i = 0; i < this.boardWidth; i += this.tileSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(i, 0);
        this.ctx.lineTo(i, this.boardHeight);
        this.ctx.stroke();
      }
      for (let j = 0; j < this.boardHeight; j += this.tileSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, j);
        this.ctx.lineTo(this.boardWidth, j);
        this.ctx.stroke();
      }

      this.snake.forEach((part, index) => {
        this.ctx.fillStyle = index === 0 ? "#ff1a1a" : "#ff4d4d";
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#ff0000";
        this.ctx.fillRect(part.x, part.y, this.tileSize, this.tileSize);
      });

      this.ctx.fillStyle = "#999999";
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#ff6600";
      this.ctx.beginPath();
      this.ctx.arc(
        this.food.x + this.tileSize / 2,
        this.food.y + this.tileSize / 2,
        this.tileSize / 2 - 2,
        0,
        2 * Math.PI
      );
      this.ctx.fill();

      this.ctx.shadowBlur = 0;
    },
    changeDirection(e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" && this.direction.y === 0)
        this.direction = { x: 0, y: -20 };
      if (e.key === "ArrowDown" && this.direction.y === 0)
        this.direction = { x: 0, y: 20 };
      if (e.key === "ArrowLeft" && this.direction.x === 0)
        this.direction = { x: -20, y: 0 };
      if (e.key === "ArrowRight" && this.direction.x === 0)
        this.direction = { x: 20, y: 0 };
    },
    handleTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    },
    handleTouchEnd(e) {
      const dx = e.changedTouches[0].screenX - this.touchStartX;
      const dy = e.changedTouches[0].screenY - this.touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && this.direction.x === 0) {
          this.direction = { x: 20, y: 0 };
        } else if (dx < 0 && this.direction.x === 0) {
          this.direction = { x: -20, y: 0 };
        }
      } else {
        if (dy > 0 && this.direction.y === 0) {
          this.direction = { x: 0, y: 20 };
        } else if (dy < 0 && this.direction.y === 0) {
          this.direction = { x: 0, y: -20 };
        }
      }
    },
    placeFood() {
      this.food.x =
        Math.floor(Math.random() * (this.boardWidth / this.tileSize)) *
        this.tileSize;
      this.food.y =
        Math.floor(Math.random() * (this.boardHeight / this.tileSize)) *
        this.tileSize;
    },
    endGame() {
      clearInterval(this.gameInterval);
      this.gameOver = true;
      this.gameStarted = false;
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
            snakeScore: this.score,
            flappyScore: this.flappyScore,
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
  mounted() {
    const canvas = this.$refs.gameCanvas;
    this.ctx = canvas.getContext("2d");
    this.draw();

    const wrapper = this.$refs.gameWrapper;
    if (wrapper) {
      wrapper.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
        },
        { passive: false }
      );
      wrapper.addEventListener("touchstart", this.handleTouchStart, { passive: false });
      wrapper.addEventListener("touchend", this.handleTouchEnd, { passive: false });
    }
  },

  beforeUnmount() {
    const wrapper = this.$refs.gameWrapper;
    if (wrapper) {
      wrapper.removeEventListener("touchmove", this.preventScroll);
      wrapper.removeEventListener("touchstart", this.handleTouchStart);
      wrapper.removeEventListener("touchend", this.handleTouchEnd);
    }
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
  position: relative;
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

.title {
  color: #ff1a1a;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-align: center;
}

.game-layout {
  display: flex;
  gap: 50px;
  align-items: center;
}

.game-container {
  position: relative;
}

canvas {
  border: 3px solid #660000;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
  border-radius: 8px;
  max-width: 100%;
  height: auto;
  touch-action: none;
}

.controls {
  margin-top: 15px;
  text-align: center;
}

.score {
  color: #ff1a1a;
  font-weight: bold;
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
