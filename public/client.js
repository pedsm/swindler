const main = document.getElementById('main');
let name;

// Let's connect to the server
var socket = io.connect('/');
// When we receive something in the welcome channel we...
// socket.on('welcome', function (data) {
//   console.log(data);
// });

socket.on('gameState', (gameState) => {
  console.log('Receiving game state')
  console.table({roomCode: gameState.code, turn: gameState.turn})
  console.table(gameState.players)
  if(gameState.turn == 0) {
    main.innerHTML = `
    <h1>Room Code: ${gameState.code}</h1>
    <h2>${name}</h2>
    <p>${gameState.players.map(player => player.name).join(',')}</p>
    `
  }
})


function getPlayerName() {
  const name = document.getElementById('nameInput').value
  if(name == '' || name == null) {
    throw Error('You need a name')
  }
  return name
}

function getRoomCode() {
  const name = document.getElementById('codeInput').value
  if(name == '' || name == null) {
    throw Error('You need a name')
  }
  return name
}

document.getElementById("createRoomBt").addEventListener('click', (e) => {
  console.log('Creating room')
  name = getPlayerName()
  socket.emit('createRoom', {name})
})

document.getElementById("joinRoomBt").addEventListener('click', (e) => {
  console.log('Joining room')
  name = getPlayerName()
  const code = getRoomCode()
  socket.emit('joinRoom', {name, code})
})
