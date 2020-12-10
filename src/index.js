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

io.on('connection', (socket) => {
	console.log('New WebSocket connection');

	socket.emit('message', 'Welcome!');
	socket.broadcast.emit('message', 'A new user has joined!');

	socket.on('sendMessage', (message, callback) => {
		if (message.length > 0) {
			io.emit('message', message);
			return callback();
		}
		callback('No text entered');
	});

	socket.on('sendLocation', ({ latitude, longitude }, callback) => {
		io.emit(
			'locationMessage',
			`https://google.com/maps?q=${latitude},${longitude}`
		);
		callback();
	});

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left!');
	});
});

server.listen(port, () => {
	console.log(`Listening to port ${port}!`);
});
