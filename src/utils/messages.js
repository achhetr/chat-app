const generateMessage = (text) => ({
	text,
	createdAt: new Date().getTime(),
});

module.exports = {
	generateMessage,
};
