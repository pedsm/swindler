const { getRoomName } = require('./roomGen')
const { log, error } = require('./log')

const serverState = {
  rooms: {}
}

function createRoom() {
  const roomCode = getRoomName();
  if(serverState.rooms[roomCode] != null) {
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

function getRoom(roomCode) {
  if(serverState.rooms[roomCode] == null) {
    error(`Room ${roomCode} does not exist`)
    return null
  }
  return serverState.rooms[roomCode]
}

function joinRoom(socket, name, roomCode) {
  const room = getRoom(roomCode)
  log(`${name}(${socket.id}) joining ${roomCode}`)
  // Join room
  socket.join(roomCode)
  room.players.push({id: socket.id, name})
}

function startGame(roomCode) {
  const gameState = getRoom(roomCode)
  gameState.turn = 1
  return gameState
}

module.exports = { 
  createRoom,
  joinRoom,
  getRoom,
  startGame
 }