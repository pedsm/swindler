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
    <p>${gameState.players.map(player => `
      <div class="player">
      <p>💷${player.name}</p>
      </div>
    `).join("")}</p>
    <input onclick="startGame()" id="startBt" type="submit" value="Start Game"/>
    `;
  } else if (gameState.turn >= 1 && gameState.turn <= maxTurns) {
    main.innerHTML = `
      <h3>Turn: ${gameState.turn}</h3>
      
      <h1>
      ${getJob(player.id).emoji} ${player.name} 
      </h1>
      <h2>${(()=> {
        return getJob(player.id).job
      }) ()} 
      </h2>
      <h2>
        ${player.company ? `(${player.company})` : ''}
      </h2>
      <h2>
      ${(() => {
        if (player.role =='ARTIST') {
          return `Level : ${player.lvl}`
        } 
        return ''
      })()}
      </h2>
      <h3>Balance: £${formatMoney(player.money)}</h3>
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
            <div class="player">
              <h3 onclick="invest('${artist.id}')">${getJob(artist.id).emoji}${artist.name}</h3>
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
            <div class="player">
              <h3>${i+1}:${getJob(player.id).emoji}${player.name}</h3>
              <h4>£ ${formatMoney(player.money)}</h4>
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

function formatMoney(money) {
  return Math.round(money*100)/100
}

function getPlayer() {
  return gameState.players.find(player => player.id == id);
}

function getJob (id) {
  if(gameState.players.find(pl => pl.id == id).role == "INVESTOR") {
    return {
      emoji: "🏢",
      job: "Investor"
    }
  }
  const rot = id.charCodeAt(0);
  const jobs  = [{
    emoji: "🤡",
    job: "Birthday Clown"
    },
    {
      emoji: "🎨",
      job: "Painter"
    },
    {
      emoji: "🎬",
      job: "Film Director"
    },
    {
      emoji: "🎤",
      job: "Singer"
    },
    {
      emoji: "🎧",
      job: "Techno DJ"
    },
    {
      emoji: "🎼",
      job: "Composer"
    },
    {
      emoji: "🎹",
      job: "Pianist"
    },
    {
      emoji: "🥁",
      job: "Drummer"
    },
    {
      emoji: "🎷",
      job: "Saxophonist"
    },
    {
      emoji: "🎺",
      job: "Trumpeter"
    },
    {
      emoji: "🎸",
      job: "Guitarist"
    },
    {
      emoji: "🎻",
      job: "Violinist"
    }]
  const job = jobs[rot % jobs.length];
  return job
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
