<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { calculateSettlements, type Player, type Settlement } from './utils/settlement'

const globalBase = ref(300)
const players = ref<Player[]>([
  { id: '1', name: 'Player 1', units: 1, current: 0 },
  { id: '2', name: 'Player 2', units: 1, current: 0 }
])

const settlements = ref<Settlement[]>([])
const hasCalculated = ref(false)

const totalBase = computed(() => players.value.reduce((sum, p) => sum + (p.units * globalBase.value), 0))
const totalCurrent = computed(() => players.value.reduce((sum, p) => sum + p.current, 0))
const isBalanced = computed(() => Math.abs(totalBase.value - totalCurrent.value) < 0.01)

const addPlayer = () => {
  const id = (players.value.length + 1).toString()
  players.value.push({
    id,
    name: `Player ${id}`,
    units: 1,
    current: 0
  })
}

const removePlayer = (index: number) => {
  if (players.value.length > 1) {
    players.value.splice(index, 1)
  }
}

const handleCalculate = () => {
  if (!isBalanced.value) {
    alert(`The totals don't match! \nTotal Base: ${totalBase.value}\nTotal Current: ${totalCurrent.value}\nDifference: ${totalCurrent.value - totalBase.value}`)
    return
  }
  settlements.value = calculateSettlements(players.value, globalBase.value)
  hasCalculated.value = true
  
  // Scroll to results
  setTimeout(() => {
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}
watch([players, globalBase], () => {
  hasCalculated.value = false
}, { deep: true })
</script>

<template>
  <main class="container">
    <header>
      <h1>Card Game Calculator</h1>
      <div class="global-settings">
        <label>
          Base Unit (e.g. 300)
          <input type="number" v-model.number="globalBase" inputmode="decimal">
        </label>
      </div>
    </header>

    <section class="players-list">
      <div v-for="(player, index) in players" :key="player.id" class="player-card">
        <div class="card-header">
          <input class="name-input" v-model="player.name" placeholder="Name">
          <div>
            <button @click="removePlayer(index)" class="btn-remove" v-if="players.length > 1">×</button>
          </div>
        </div>
        
        <div class="card-body">
          <div class="input-group">
            <label>Units</label>
            <input type="number" v-model.number="player.units" inputmode="decimal">
          </div>
          <div class="input-group">
            <label>Current</label>
            <input type="number" v-model.number="player.current" inputmode="decimal">
          </div>
          <div class="net-display" :class="{ loss: player.current < (player.units * globalBase), win: player.current > (player.units * globalBase) }">
            {{ player.current - (player.units * globalBase) >= 0 ? '+' : '' }}{{ (player.current - (player.units * globalBase)).toFixed(0) }}
          </div>
        </div>
        <div class="effective-base">
          Total Base: {{ player.units * globalBase }}
        </div>
      </div>
      
      <button @click="addPlayer" class="btn-secondary">+ Add Player</button>
    </section>

    <footer class="controls">
      <div class="status-bar" :class="{ 'not-balanced': !isBalanced }">
        <span>Total Base: {{ totalBase }}</span>
        <span>Total Current: {{ totalCurrent }}</span>
      </div>
      
      <button @click="handleCalculate" class="btn-primary" :disabled="!isBalanced">
        Calculate Settlements
      </button>
    </footer>

    <section v-if="hasCalculated" id="results" class="results-section">
      <h2>Settlements</h2>
      <div v-if="settlements.length === 0" class="no-debts">
        Everyone is even! No transfers needed.
      </div>
      <div v-else class="settlement-list">
        <div v-for="(s, i) in settlements" :key="i" class="settlement-item">
          <span class="from">{{ s.from }}</span>
          <span class="arrow">➔</span>
          <span class="to">{{ s.to }}</span>
          <span class="amount">${{ s.amount }}</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.global-settings {
  padding: 1rem;
  background: rgba(100, 108, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.global-settings label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.player-card {
  background: var(--card-bg, #2a2a2a);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #333;
}

.card-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.name-input {
  font-weight: bold;
  border: none;
  background: transparent;
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.name-input:focus {
  outline: none;
  border-bottom: 2px solid #646cff;
}

.btn-remove {
  background: #ff4757;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
}

.card-body {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.input-group label {
  font-size: 0.8rem;
  opacity: 0.7;
}

.net-display {
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: bold;
  min-width: 3rem;
  text-align: center;
}

.net-display.loss { color: #ff4757; }
.net-display.win { color: #2ed573; }

.effective-base {
  font-size: 0.75rem;
  opacity: 0.5;
  margin-top: 0.5rem;
  text-align: right;
}

.btn-primary {
  background: #646cff;
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.btn-primary:disabled {
  background: #444;
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  background: #444;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  background: #222;
}

.status-bar.not-balanced {
  color: #ff4757;
  border: 1px solid #ff4757;
}

.results-section {
  background: rgba(100, 108, 255, 0.05);
  padding: 1.5rem 1rem;
  border-radius: 12px;
  border: 1px dashed #646cff;
  margin-top: 1rem;
}

.settlement-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.from { font-weight: bold; color: #ff4757; }
.to { font-weight: bold; color: #2ed573; }
.amount { margin-left: auto; font-family: monospace; font-size: 1.2rem; }
.arrow { opacity: 0.5; }

@media (prefers-color-scheme: light) {
  .player-card { background: white; border-color: #eee; }
  .status-bar { background: #eee; }
  .results-section { background: white; border-color: #646cff; }
  .settlement-item { background: #f9f9f9; }
  .name-input { color: #213547; }
}
</style>
