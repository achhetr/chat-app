const socket = io();

// DOM Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template')
	.innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

socket.on('message', (message) => {
	console.log(message);
	const html = Mustache.render(messageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a'),
	});

	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (url) => {
	console.log(url, 'from location');
	const html = Mustache.render(locationTemplate, {
		url: url.url,
		createdAt: moment(url.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	$messageFormButton.setAttribute('disabled', 'disabled');

	const message = $messageFormInput.value;
	socket.emit('sendMessage', message, (error) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log('Message delivered!');
	});
});

$sendLocationButton.addEventListener('click', () => {
	$sendLocationButton.setAttribute('disabled', 'disabled');

	if (!navigator.geolocation) {
		return alert('Your browser does not support Geolocation');
	}
	navigator.geolocation.getCurrentPosition((position) => {
		const { latitude, longitude } = position.coords;
		socket.emit(
			'sendLocation',
			{
				latitude,
				longitude,
			},
			() => {
				console.log('Location shared');
				$sendLocationButton.removeAttribute('disabled');
			}
		);
	});
});

socket.emit('join', { username, room }, (error) => {
	if (error) {
		console.log(error);
	}
});
