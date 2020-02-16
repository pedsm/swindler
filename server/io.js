// Constants 
const { 
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  invest,
  getPlayerRoom,
  removeFromRoom,
  endTurnCheck
} = require('./gameService')         // require the custom gameService .js
const { log } = require('./log')     // and log

// setupSocket lambda: 
// sets socket ID to socket.id 
const setupSocket = (io) => {
  io.on('connection', (socket) => {
    socket.emit('setId', { id: socket.id })
    log(`User ${socket.id} has connected`)

    // on Createa room, grab the name object, call the createa room function and join room.
    // socket emits a game state  for the room with the roomCode (createad by create room)
    socket.on('createRoom', ({name}) => {
      log(`Creating room for ${name}`)
      const roomCode = createRoom()     // Coverd this function in gameService.js
      joinRoom(socket, name, roomCode)  // We join the Room. 
      socket.emit('gameState', getRoom(roomCode))  // We emit the gameState = to roomCode
    })

    // on Join room (with name and code), we check again for the code to be all upperCase
    socket.on('joinRoom', ({name, code}) => {
      const roomCode = code.toUpperCase()
      log(`${name} is joining room ${roomCode}`)
      joinRoom(socket, name, roomCode)  // We join the Room.
      socket.emit('gameState', getRoom(roomCode)) // We emit the gameState = to roomCode
      io.to(roomCode).emit('gameState', getRoom(roomCode)) // Idk what this does but emits a game state for io? 
    })

    // TURN 0 - on start game with code we start game and generate a new gameState!
    socket.on('startGame', ({ code }) => {
      const gameState = startGame(code) 
      io.to(code).emit('gameState', gameState) //again a io state? 
    })

    // TURN 1 - on invest state? create or reference a project with roomCode and aristId and do:
    socket.on('invest', ({ roomCode, artistId }) => {
      const gameState = invest(socket.id, roomCode, artistId) // call the invest function 
      io.to(roomCode).emit('gameState', gameState) // do the investing functionang change state
      const nextTurn = endTurnCheck(gameState)    // do the end turn check 
      if(nextTurn != null) {
          io.to(roomCode).emit('gameState', nextTurn)  // emmit a nextTurn game state if the nextTurn is not null
      }
    })

    socket.on('disconnect', (reason) => {
      // Find pleb and remove him
      const roomCode = getPlayerRoom(socket.id)
      if(roomCode != null) {
        log(`Pleb left room:${roomCode}`)
        const gameState = removeFromRoom(socket.id, roomCode)
        io.to(roomCode).emit('gameState', gameState)
      }
      log(`Client disconnected because: ${reason}`)
    })
    
  });
}

module.exports = {
  setupSocket
}