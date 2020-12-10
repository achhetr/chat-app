const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');

socket.on('message', (message) => {
	console.log(message);
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

$sendLocation.addEventListener('click', () => {
	$sendLocation.setAttribute('disabled', 'disabled');

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
				$sendLocation.removeAttribute('disabled');
			}
		);
	});
});
