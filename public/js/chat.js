const socket = io();

socket.on('message', (message) => {
	console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const message = e.target.elements.message.value;
	e.target.elements.message.value = '';
	socket.emit('sendMessage', message);
});

document.querySelector('#send-location').addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Your browser does not support Geolocation');
	}
	navigator.geolocation.getCurrentPosition((position) => {
		const { latitude, longitude } = position.coords;
		socket.emit('sendLocation', {
			latitude,
			longitude,
		});
	});
});
