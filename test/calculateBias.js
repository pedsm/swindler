const { 
  randomLevel, 
  levelToMultiplier 
} = require('../server/gameService')
const { log } = console
const iterations = 10

function simulateBias() {
  let money = 1000;
  for (let i = 0; i < iterations; i++) {
    log(`Round ${i}: ${money}`)
    const level = randomLevel()
    if(level != 0) {
      money = money * levelToMultiplier(level)
    }
  }
}

simulateBias()