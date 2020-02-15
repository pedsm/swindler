const { 
  createRoom,
  joinRoom,
  getRoom,
  startGame
} = require('./gameService')
const { log } = require('./log')

const setupSocket = (io) => {
  io.on('connection', (socket) => {
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

    //TURN 0

    socket.on('startGame', ({ code }) => {
      const gameState = startGame(code)
      io.to(code).emit('gameState', gameState)
    })


    socket.on('disconnect', (reason) => {
      log(`Client disconnected because: ${reason}`)
    })
    
  });
}

module.exports = {
  setupSocket
}