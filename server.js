const PORT = 8080;
const BASE_URL = '/api';

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(`${BASE_URL}/v1/ping`, (req, res) => res.send('pong'));

http.createServer(app).listen(PORT, () => {
  console.log(`> 🚀 Server running at ${PORT}`);
});
