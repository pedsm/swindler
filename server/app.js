// import express to make the server
const express = require('express')
// make the server
const app = express()
// merge the express server with the Socket io server
var server = require('http').Server(app);
var io = require('socket.io')(server);
// Select the port, defaults to 3000 or takes from env
const port = 3000 || process.env.PORT

// Serves all the files in the public folder
app.use(express.static('public'))

console.log("Hello I am the server")
// Starts up teh server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// When someone connects
io.on('connection', (socket) => {
  console.log('OI OI! New people have joined the party')
  // Send something over on the channel welcome
  socket.emit('welcome', 'Welcome!!!!');
  
  // When they do something on the channel doge
  // we do something with the data
  socket.on('doge', (data) => {
    console.log("Receive the following doge");
    console.log(data);
  });
});