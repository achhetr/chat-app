const path = require('path');
const http = require('http');
require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

let chat = '';

io.on('connection', (socket) => {
	console.log('New WebSocket connection');

	socket.on('sendMessage', (message) => {
		io.emit('message', message);
	});
});

server.listen(port, () => {
	console.log(`Listening to port ${port}!`);
});
