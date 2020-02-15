// import express to make the server
const express = require('express')
const app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 3000
const { setupSocket } = require('./io')

app.use(express.static('public'))

console.log("Hello I am the server")
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})


setupSocket(io)