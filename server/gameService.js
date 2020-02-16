const { getRoomName } = require('./roomGen')
const { log, error } = require('./log')
const faker = require('faker');

const serverState = {
  rooms: {}
}

function createRoom() {
  const roomCode = getRoomName();
  if (serverState.rooms[roomCode] != null) {
    return createRoom()
  }
  serverState.rooms[roomCode] = {
    players: [], // No players yet
    code: roomCode,
    turn: 0 // Waiting room
  }

  log(`Room: ${roomCode} has been created`)
  return roomCode
}

function joinRoom(socket, name, roomCode) {
  const room = getRoom(roomCode)
  if(room == null) {
    return
  }
  log(`${name}(${socket.id}) joining ${roomCode}`)
  // Join room
  socket.join(roomCode)
  room.players.push({ id: socket.id, name })
}

// utils
function getRoom(roomCode) {
  if (serverState.rooms[roomCode] == null) {
    error(`Room ${roomCode} does not exist`)
    return null
  }
  return serverState.rooms[roomCode]
}
function getPlayer(gameState, playerId) {
  return gameState.players.find(player => player.id == playerId)
}
// room logic


// TURN 0 
function startGame(roomCode) {
  const gameState = getRoom(roomCode)
  gameState.turn = 1
  gameState.players = assignPlayers(gameState.players)
  return gameState
}

// Player functionalities: 
function createInvestor(player) {
  const fakeCompany = faker.company.companyName();
  return {
    id: player.id,
    name: player.name,
    role: "INVESTOR",
    money: 1000,
    company: fakeCompany,
    investedIn: null
  }
}

function createArtist(player) {
  return {
    id: player.id,
    name: player.name,
    role: "ARTIST",
    money: 0,
    lvl: randomLevel()
  }
}

function randomLevel() {
  return Math.round(Math.random() * 10)
}

// Function to assign artists/investors:
function assignPlayers(players) {
  const numberInvestor = Math.ceil(players.length/2)
  return players.map((player, i) => {
    if(i < numberInvestor) {
      return createInvestor(player)
    }
    return createArtist(player)
  })
}

// TURN 1 - 3
function invest(playerId, roomCode, artistId) {
  log(`${playerId} is investing in ${artistId}`)
  const gameState = getRoom(roomCode)
  const investor = getPlayer(gameState, playerId)
  investor.investedIn = artistId
  return gameState
}

function endTurnCheck(gameState) {
  const investorLeft = gameState.players
    .filter(inv => inv.role == "INVESTOR")
    .filter(inv => inv.investedIn == null)
  if (investorLeft.length != 0) {
    return null
  }
  log('Turn has ended all investors have finished')
  const investors = gameState.players.filter(p => p.role == "INVESTOR")
  investors.forEach((inv) => {
    const artist = getPlayer(gameState, inv.investedIn)
    const moneyInvested = inv.money
    const returnOnInvestment = inv.money * levelToMultiplier(artist.lvl)
    inv.money = returnOnInvestment
    artist.money += moneyInvested
    inv.investedIn = null
  })
  const artists = gameState.players.filter(p => p.role == 'ARTIST')
  artists.forEach((art) => {
    art.lvl = randomLevel()
  })
  gameState.turn++
  return gameState
}

function levelToMultiplier(lv) {
  if (lv >= 5) {
    return lv / 5
  }
  return lv / (lv + 1)
}


module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  invest, 
  levelToMultiplier,
  randomLevel,
  endTurnCheck
}