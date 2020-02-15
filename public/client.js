console.log("Hello I am the client")

// Let's connect to the server
var socket = io.connect('/');
// When we receive something in the welcome channel we...
// socket.on('welcome', function (data) {
//   console.log(data);
// });


// function sendDoge() {
//  socket.emit('doge', 'dogeeeeee') 
// }
// This follwoing line runs the function every 1000ms
// setInterval(sendDoge, 1000)
function getPlayerName() {
  const name = document.getElementById('nameInput').value
  if(name == '' || name == null) {
    throw Error('You need a name')
  }
  return name
}

document.getElementById("createRoomBt").addEventListener('click', (e) => {
  console.log('Creating room')
  socket.emit('createRoom', {name: getPlayerName()})
})
