const main = document.getElementById("main");
const maxTurns = 5
let gameState = {};
let id;

var socket = io.connect("/");

socket.on("setId", obj => {
  id = obj.id;
});

socket.on("gameState", newState => {
  gameState = newState;
  const player = getPlayer();
  console.log("Receiving game state");
  console.table({ roomCode: gameState.code, turn: gameState.turn });
  console.table(gameState.players);
  if (gameState.turn == 0) {
    main.innerHTML = `
    <h1>Room Code: ${gameState.code}</h1>
    <h2>${player.name}</h2>
    <p>${gameState.players.map(player => player.name).join(",")}</p>
    <input onclick="startGame()" id="startBt" type="submit" value="Start Game"/>
    `;
  } else if (gameState.turn >= 1 && gameState.turn <= maxTurns) {
    main.innerHTML = `
      <h3>Turn: ${gameState.turn}</h3>
      <h1>Name : ${player.name}</h1>
      <h2>Role : ${player.role}</h2>
      <h2>
      ${(() => {
        if (player.role =='ARTIST') {
          return `Level : ${player.lvl}`
        } 
        return `Company : ${player.company}`
      })()}
      </h2>
      <h3>Balance: £${player.money}</h3>
      <h3>
      ${(()=>{
        if (gameState.players.find(player=>player.lvl==0) != null) {
          return `OI OI There is a SWINDLER in this room`
        }
        return ''
      })()}</h3>
      <div>
        ${(() => {
          if(player.role == 'ARTIST' || player.investedIn) {
            return '';
          }
          return gameState.players
            .filter(artist => artist.role == 'ARTIST')
            .map((artist => `
            <div>
              <h3 onclick="invest('${artist.id}')">${artist.name}</h3>
            </div>
            `)).join('')
        })()}
      </div>
    `;
  } else if (gameState.turn == maxTurns + 1){
    main.innerHTML = `
      <h1>Results of room: ${gameState.code}</h1>
      <div>
        ${(() => {
          return gameState.players
            .sort((a,b) => b.money - a.money)
            .map(((player, i) => `
            <div>
              <h3>${i+1}:${player.name}</h3>
              <h4>£ ${player.money}</h4>
            </div>
            `)).join('')
        })()}
      </div>
    `
  } else {
    main.innerHTML = `<h1>Not yet implemented</h1>`;
    console.error("I don't know how to render this");
    console.log(gameState);
  }
});

// TURN 0
function startGame() {
  const { code } = gameState;
  socket.emit("startGame", { code });
}

// TURN 1-3
function invest(artistId) {
  console.log(artistId)
  socket.emit('invest', {
    roomCode: gameState.code,
    artistId
  })
}

// Helpers

function getPlayer() {
  return gameState.players.find(player => player.id == id);
}

// Pre game stuff
function getPlayerName() {
  const name = document.getElementById("nameInput").value;
  if (name == "" || name == null) {
    throw Error("You need a name");
  }
  return name;
}

function getRoomCode() {
  const name = document.getElementById("codeInput").value;
  if (name == "" || name == null) {
    throw Error("You need a name");
  }
  return name;
}

document.getElementById("createRoomBt").addEventListener("click", e => {
  console.log("Creating room");
  name = getPlayerName();
  socket.emit("createRoom", { name });
});

document.getElementById("joinRoomBt").addEventListener("click", e => {
  console.log("Joining room");
  name = getPlayerName();
  const code = getRoomCode();
  socket.emit("joinRoom", { name, code });
});
