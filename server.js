const PORT = 8080;
const BASE_URL = '/api';

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const { uuid } = require('uuidv4');
const redis = require('redis');
const bodyParser = require('body-parser');
// const memory = redis.createClient();
const IOServer = require('socket.io');
const app = express();
const io = new IOServer();

app.io = io;

app.use(cors());
app.use(bodyParser.json({}));
app.use(morgan('dev'));

app.use(`${BASE_URL}/v1/ping`, (req, res) => res.send('pong'));

const roomRouter = express.Router();

class MemoryDatabase {
  constructor({ redisClient }) {
    this.memory = redisClient;
  }

  async keys(pattern) {
    return new Promise((resolve, reject) => {
      this.memory.keys(pattern, (err, keys) => {
        if (err) {
          reject(err);
        }

        resolve(keys);
      });
    });
  }
  async set(key, value) {
    console.log(value);
    return new Promise((resolve, reject) => {
      this.memory.set(key, JSON.stringify(value), err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.memory.get(key, (err, value) => {
        if (err) {
          reject(err);
        }

        resolve(JSON.parse(value));
      });
    });
  }
}

const memory = new MemoryDatabase({ redisClient: redis.createClient() });

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

const internalServerError = res => res.status(500).json({ msg: 'Oops' });

roomRouter.route('/').post(async (req, res) => {
  try {
    const { roomName, userName } = req.body;
    const owner = { _id: uuid(), userName };
    const room = {
      _id: uuid(),
      roomName,
      owner,
      code: RoomCodeGenerator.generate(),
      participants: [owner],
    };

    await memory.set(room._id, room);
    return res.status(201).json(room);
  } catch (ex) {
    console.log(ex);
    return internalServerError(res);
  }
});

roomRouter.route('/:id').get(async (req, res) => {
  try {
    const room = await memory.get(req.params.id);
    return res.json(room);
  } catch (ex) {
    console.log(ex);
    return internalServerError(res);
  }
});

roomRouter.route('/:id/config').post(async (req, res) => {
  try {
    const { sequence } = req.body;
    const room = await memory.get(req.params.id);
    console.log(room._id, { ...room, sequence });
    const updated = { ...room, sequence };
    await memory.set(room._id, updated);
    return res.json(updated);
  } catch (ex) {
    console.log(ex);
    return internalServerError(res);
  }
});

roomRouter.route('/:id/cards').post(async (req, res) => {
  try {
    const { cards } = req.body;
    const room = await memory.get(req.params.id);
    const updated = {
      ...room,
      cards: [...(room.cards || []), cards.map(c => ({ ...c, _id: uuid() }))],
    };

    await memory.set(room._id, updated);
    return res.status(201).json(updated);
  } catch (err) {
    console.log(err);
    return internalServerError(res);
  }
});

roomRouter.route('/join/:roomCode').post(async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { name } = req.body;

    if (!roomCode) {
      return res.status(400).json({ msg: 'Expected a room code' });
    }

    const keys = await memory.keys('*');

    const rooms = (
      await Promise.all(
        keys.map(async key => ({ key, value: await memory.get(key) }))
      )
    ).map(({ value }) => value);

    const room = rooms.find(({ code }) => code === roomCode);

    if (!room) {
      return res.status(400).json({ msg: 'Room not found' });
    }

    await memory.set({
      ...room,
      participants: [...room.participants, { name, _id: uuid() }],
    });

    return res.json(room);
  } catch (ex) {
    console.log(ex);
    return internalServerError(res);
  }
});

app.use(`${BASE_URL}/v1/rooms`, roomRouter);

http.createServer(app).listen(PORT, () => {
  console.log(`> 🚀 Server running at ${PORT}`);
});
