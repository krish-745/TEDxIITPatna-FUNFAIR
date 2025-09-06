<template>
  <div class="landing-wrapper">
    <!-- Hero -->
    <section class="hero">
      <h1 class="title">TEDxIITPatna FUNFAIR</h1>
      <p class="subtitle">Play, Compete, and Climb the Leaderboard to win Exciting Rewards!</p>
    </section>

    <!-- Leaderboard -->
    <section class="leaderboard">
      <h2>Leaderboard</h2>

      <div v-if="loading">
        <p>Loading leaderboard...</p>
      </div>
      <ul v-else-if="leaderboard.length > 0">
        <li
          v-for="(player, index) in leaderboard.slice(0, 3)"
          :key="index"
          :class="{
            gold: index === 0,
            silver: index === 1,
            bronze: index === 2
          }"
        >
          <span>{{ player.roll }}</span>
          <span class="score">{{ player.totalScore }}</span>
        </li>
      </ul>
      <p v-else>No scores yet. Be the first to play!</p>
    </section>

    <!-- Games -->
    <section class="games">
      <div
        v-for="(game, i) in games"
        :key="i"
        class="game-card"
        @click="launchGame(game.route)"
      >
        <h3>{{ game.name }}</h3>
        <p>{{ game.description }}</p>
        <button @click.stop="launchGame(game.route)">Play</button>
      </div>
    </section>

    <!-- External Link Button -->
    <div class="external-link">
      <a
        href="https://tedxiitpatna.iitp.ac.in/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button>Check out TEDxIITPatna's Official Website</button>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "FunfairLanding",
  data() {
    return {
      leaderboard: [],
      games: [
        { name: "Snake", description: "Classic snake game.", route: "/snake" },
        { name: "Flappy Bird", description: "Tap to fly through obstacles.", route: "/flappybird" },
        { name: "Stack The Blocks", description: "Test your timing and precision.", route: "/stacktheblocks" },
      ],
      loading: true,
      API_URL:
        "https://script.google.com/macros/s/AKfycbyZERpdFBcjiPbUlzOfhMjuQUAFzxjDWWKaCD9jwbsKexbE8cBto2CSgPT3nrcvJy14ew/exec",
    };
  },
  methods: {
    async fetchLeaderboard() {
      this.loading = true;
      try {
        const res = await fetch(`${this.API_URL}?action=list`);
        const data = await res.json();
        this.leaderboard = data;
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        this.loading = false;
      }
    },
    launchGame(route) {
      this.$router.push(route);
    },
  },
  mounted() {
    this.fetchLeaderboard();
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.landing-wrapper {
  min-height: 100vh;
  background: linear-gradient(160deg, #000, #1a0000);
  color: #fff;
  font-family: "Press Start 2P", monospace, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.hero {
  text-align: center;
  margin: 20px 0 30px 0;
}

.title {
  font-size: 26px;
  color: #ff1a1a;
}

.subtitle {
  color: #ccc;
  font-size: 12px;
  margin-top: 8px;
  text-shadow: 0 0 5px #444;
}

.leaderboard {
  background: rgba(20, 0, 0, 0.9);
  border: 2px solid #660000;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 25px;
  width: 300px;
  text-align: center;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

.leaderboard h2 {
  color: #ff3333;
  font-size: 20px;
  margin-bottom: 12px;
}

.leaderboard ul {
  list-style: none;
  padding: 0;
}

.leaderboard li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #333;
}

.score {
  color: #ff1a1a;
}

.games {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
}

.game-card {
  background: rgba(30, 0, 0, 0.8);
  border: 2px solid #660000;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.game-card:hover {
  transform: scale(1.05);
}

.game-card h3 {
  color: #ff4d4d;
  margin-bottom: 8px;
  font-size: 14px;
}

.game-card p {
  font-size: 10px;
  color: #ccc;
  margin-bottom: 12px;
}

button {
  background: #b30000;
  color: white;
  font-family: inherit;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
  transition: 0.2s;
  font-size: 10px;
}

button:hover {
  background: #cc0000;
  transform: scale(1.1);
}

.gold {
  color: gold;
  font-weight: bold;
  /* text-shadow: 0 0 8px gold; */
}

.silver {
  color: silver;
  font-weight: bold;
  /* text-shadow: 0 0 8px silver; */
}

.bronze {
  color: #cd7f32; /* bronze */
  font-weight: bold;
  /* text-shadow: 0 0 8px #cd7f32; */
}

.external-link {
  margin-top: 30px;
  text-align: center;
}

.external-link button {
  background: #ff1a1a;
  color: white;
  font-family: "Press Start 2P", monospace, sans-serif;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(255, 0, 0, 0.7);
  transition: 0.2s;
  font-size: 12px;
}

.external-link button:hover {
  background: #cc0000;
  transform: scale(1.05);
}

</style>
