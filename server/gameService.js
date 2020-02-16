const { getRoomName } = require('./roomGen')
const { log, error } = require('./log')
const faker = require('faker')

const serverState = {
  rooms: {}
}

// Createas a room, get roomCode from getRoomName function
function createRoom() {
  const roomCode = getRoomName();
  if (serverState.rooms[roomCode] != null) {  // If not null, create it again
    return createRoom()
  }

  // Server state is a const with a rooms hash inside
  // Set that rooms hash, to have a players array, a code and a turn number
  serverState.rooms[roomCode] = {
    players: [], // No players yet
    code: roomCode,
    turn: 0 // Waiting room
  }

  log(`Room: ${roomCode} has been created`)
  return roomCode
}

// Function to join the room, pass the socket, name, and roomCode
function joinRoom(socket, name, roomCode) {
  const room = getRoom(roomCode)
  if(room == null) {
    return
  }
  log(`${name}(${socket.id}) joining ${roomCode}`)
  // Join room
  socket.join(roomCode)
  room.players.push({ id: socket.id, name })  // We push a object with a socket id and a name in players  
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


// TURN 0  - we get the game state, we assignPlayersm passing the players array, and return the state
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
    prevMoney: null,
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
    prevMoney: null,
    lvl: randomLevel()
  }
}

function randomLevel() {
  return 0
  return Math.round(Math.random() * 10)
}

// Function to assign artists/investors - I wrote this so no comments
function assignPlayers(players) {
  const numberInvestor = Math.ceil(players.length/2)
  return players.map((player, i) => {
    if(i < numberInvestor) {
      return createInvestor(player)
    }
    return createArtist(player)
  })
}

// TURN 1 - 3 - takes a playerId, roomCode, and artistId
function invest(playerId, roomCode, artistId) {
  log(`${playerId} is investing in ${artistId}`)   //player Id is investing in artist id. 
  const gameState = getRoom(roomCode)              //we get the state.
  const investor = getPlayer(gameState, playerId)  //we get the investor and the state
  investor.investedIn = artistId                   //we set the investedIn var to the artistID
  return gameState                                 //and we return the state
}

function endTurnCheck(gameState) {
  const investorLeft = gameState.players
    .filter(inv => inv.role == "INVESTOR")
    .filter(inv => inv.investedIn == null)
    .filter(inv => inv.money != 0) // Get the list of Investors that did not invested and are not bankrupt
  if (investorLeft.length != 0) {
    return null
  }                                        // Return null if there are still inventors that did not invested

  log('Turn has ended all investors have finished')
  const investors = gameState.players.filter(p => p.role == "INVESTOR").filter(inv => inv.money != 0) // The way we calculate the money for investors and artists
  investors.forEach((inv) => {
    const artist = getPlayer(gameState, inv.investedIn)
    const moneyInvested = inv.money
    const returnOnInvestment = inv.money * levelToMultiplier(artist.lvl)
    // Log old money counts for next day what?
    inv.prevMoney = inv.money
    artist.prevMoney = artist.money
    // Calculate new money
    inv.money = returnOnInvestment
    artist.money += moneyInvested
    inv.investedIn = null
  })
  const artists = gameState.players.filter(p => p.role == 'ARTIST')  // Setting a random level for the Artists
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

function getPlayerRoom(playerId) {
  for([key, room] of Object.entries(serverState.rooms)) {
    if(room.players.find(pl => pl.id == playerId) != null) {
      return room.code
    }
  }
  return null
}

function removeFromRoom(playerId, roomCode) {
  log(`Removing ${playerId} from room: ${roomCode}`)
  const room = getRoom(roomCode)
  const index = room.players.map(p => p.id).indexOf(playerId)
  room.players.splice(index, 1)
  return room
}


module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  invest, 
  levelToMultiplier,
  randomLevel,
  removeFromRoom,
  getPlayerRoom,
  endTurnCheck
}