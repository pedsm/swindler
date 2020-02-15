const { 
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  invest,
  endTurnCheck
} = require('./gameService')
const { log } = require('./log')

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    socket.emit('setId', { id: socket.id })

    log(`User ${socket.id} has connected`)
    socket.on('createRoom', ({name}) => {
      log(`Creating room for ${name}`)
      const roomCode = createRoom()
      joinRoom(socket, name, roomCode)
      socket.emit('gameState', getRoom(roomCode))
    })

    socket.on('joinRoom', ({name, code}) => {
      log(`${name} is joining room ${code}`)
      joinRoom(socket, name, code)
      socket.emit('gameState', getRoom(code))
      io.to(code).emit('gameState', getRoom(code))
    })

    // TURN 0
    socket.on('startGame', ({ code }) => {
      const gameState = startGame(code)
      io.to(code).emit('gameState', gameState)
    })

    // TURN 1
    socket.on('invest', ({ roomCode, artistId }) => {
      const gameState = invest(socket.id, roomCode, artistId)
      io.to(roomCode).emit('gameState', gameState)
      const nextTurn = endTurnCheck(gameState)
      if(nextTurn != null) {
          io.to(roomCode).emit('gameState', nextTurn)
      }
    })

    socket.on('disconnect', (reason) => {
      log(`Client disconnected because: ${reason}`)
    })
    
  });
}

module.exports = {
  setupSocket
}