const { createRoom, joinRoom, getRoom } = require('./gameService')
const { log } = require('./log')

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    log(`User ${socket.id} has connected`)
    // log('OI OI! New people have joined the party')
    // Send something over on the channel welcome
    // socket.emit('welcome', 'Welcome!!!!');

    // socket.on('doge', (data) => {
    //   log("Receive the following doge");
    //   log(data);
    // });
    socket.on('createRoom', ({name}) => {
      log(`Creating room for ${name}`)
      const roomCode = createRoom()
      joinRoom(socket, name, roomCode)
      socket.emit(`gameState`, getRoom(roomCode))
    })


    socket.on('disconnect', (reason) => {
      log(`Client disconnected because: ${reason}`)
    })
    
  });
}

module.exports = {
  setupSocket
}