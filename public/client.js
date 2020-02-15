const main = document.getElementById('main')
let gameState = {}
let id

var socket = io.connect('/')

socket.on('setId', (obj) => {id = obj.id})

socket.on('gameState', (newState) => {
  gameState = newState
  const player = getPlayer();
  console.log('Receiving game state')
  console.table({roomCode: gameState.code, turn: gameState.turn})
  console.table(gameState.players)
  if(gameState.turn == 0) {
    main.innerHTML = `
    <h1>Room Code: ${gameState.code}</h1>
    <h2>${player.name}</h2>
    <p>${gameState.players.map(player => player.name).join(',')}</p>
    <input onclick="startGame()" id="startBt" type="submit" value="Start Game"/>
    `
  } else if(gameState.turn >= 1 && gameState.turn <= 3) {
    main.innerHTML = `
      <h1>Name : ${player.name}</h1>
      <h2>Role : player.role</h2>
      <h3>Balance: £player.money</h3>
    `
  } else {
    main.innerHTML = `<h1>Not yet implemented</h1>`
    console.error("I don't know how to render this")
    console.log(gameState)
  }
})

// TURN 0
function startGame() {
  const { code } = gameState
  socket.emit('startGame', { code });
}

// TURN 1-3

// Helpers

function getPlayer() {
  return gameState.players.find(player => player.id == id)
}



// Pre game stuff
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
