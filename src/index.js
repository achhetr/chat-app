const path = require('path');
require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

app.listen(port, () => {
	console.log(`Listening to port ${port}!`);
});
