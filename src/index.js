const path = require('path');
const http = require('http');
require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');
const {
	addUser,
	getUser,
	removeUser,
	getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
	console.log('New WebSocket connection');

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });
		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('Chat App', 'Welcome'));
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				generateMessage('Chat App', `${user.username} has joined!`)
			);
		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id);

		if (message.length > 0) {
			io.to(user.room).emit(
				'message',
				generateMessage(user.username, message)
			);
			return callback();
		}
		callback();
	});

	socket.on('sendLocation', ({ latitude, longitude }, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			'locationMessage',
			generateLocationMessage(
				user.username,
				`https://google.com/maps?q=${latitude},${longitude}`
			)
		);
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				generateMessage('Chat App', `${user.username} has left!`)
			);
		}
	});
});

server.listen(port, () => {
	console.log(`Listening to port ${port}!`);
});
