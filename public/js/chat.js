const socket = io();

// DOM Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template')
	.innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	const $newMessage = $messages.lastElementChild;

	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	const visibleHeight = $messages.offsetHeight;
	const containerHeight = $messages.scrollHeight;

	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a'),
	});

	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('locationMessage', (message) => {
	console.log(message, 'from location');
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
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
		alert(error);
		location.href = '/';
	}
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	$sidebar.innerHTML = html;
});
