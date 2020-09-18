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

class RoomCodeGenerator {
  static generate() {
    const alphabet = 'abcdefghijklmnopqrstuvxwyz';
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    let code = '';
    for (let i = 0; i <= 4; i++) {
      code +=
        parseInt(Math.random() * 2) % 2 === 0
          ? alphabet[
              parseInt(Math.random() * 99999) % alphabet.length
            ].toUpperCase()
          : numbers[parseInt(Math.random() * 99999) % numbers.length];
    }

    return code;
  }
}

roomRouter.route('/').post((req, res) => {
  const { roomName, userName } = req.body;
  const owner = { _id: uuid(), userName };
  const room = {
    _id: uuid(),
    roomName,
    owner,
    code: RoomCodeGenerator.generate(),
    participants: [owner],
  };
  memory.set(room._id, JSON.stringify(room), err => {
    if (err) {
      return res.status(500).json({ msg: 'Ooops' });
    }
    return res.status(201).json(room);
  });
});

roomRouter.route('/:id').get((req, res) => {
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
