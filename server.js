const PORT = 8080;
const BASE_URL = '/api';

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const { uuid } = require('uuidv4');
const redis = require('redis');
const bodyParser = require('body-parser');
const memory = redis.createClient();

const app = express();

app.use(cors());
app.use(bodyParser.json({}));
app.use(morgan('dev'));

app.use(`${BASE_URL}/v1/ping`, (req, res) => res.send('pong'));

const roomRouter = express.Router();

roomRouter.route('/').post((req, res) => {
  const { roomName, userName } = req.body;
  const owner = { _id: uuid(), userName };
  const room = { _id: uuid(), roomName, owner, participants: [owner] };
  memory.set(room._id, JSON.stringify(room), err => {
    if (err) {
      return res.status(500).json({ msg: 'Ooops' });
    }
    return res.status(201).json(room);
  });
});

roomRouter.route('/:id').get((req, res) => {
  console.log(`id: ${req.params.id}`);
  memory.get(req.params.id, (err, room) => {
    if (err) {
      return res.status(500).json({ msg: 'Oops' });
    }
    return res.json(JSON.parse(room));
  });
});

app.use(`${BASE_URL}/v1/rooms`, roomRouter);

http.createServer(app).listen(PORT, () => {
  console.log(`> 🚀 Server running at ${PORT}`);
});
