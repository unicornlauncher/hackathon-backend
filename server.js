const PORT = 8080;
const BASE_URL = '/api';

const redis = require('redis');
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const { uuid } = require('uuidv4');
const bodyParser = require('body-parser');
const IOServer = require('socket.io');
const app = express();
const { MemoryDatabase } = require('./memory-database');
const { RoomsController } = require('./rooms-controller');

app.use(cors('*'));
app.use(bodyParser.json({}));
app.use(morgan('dev'));

const roomRouter = express.Router();
const memory = new MemoryDatabase({ redisClient: redis.createClient() });
const server = http.createServer(app);
const io = new IOServer(server);
const roomsController = new RoomsController({ memory, io, uuid });

app.use(`${BASE_URL}/v1/ping`, (_, res) => res.send('pong'));

roomRouter.route('/').post(roomsController.create);
roomRouter.route('/:id').get(roomsController.get);
roomRouter.route('/:id/config').post(roomsController.setConfig);
roomRouter.route('/:id/cards').post(roomsController.addCards);
roomRouter.route('/:roomId/cards/:cardId').delete(roomsController.deleteCard);
roomRouter.route('/join/:roomCode').post(roomsController.join);

roomRouter
  .route('/:roomId/cards/:cardId/stage')
  .post(roomsController.stageCardToVote);

roomRouter
  .route('/:roomId/cards/:cardId/unstage')
  .post(roomsController.unstageCardFromVoting);

roomRouter
  .route('/:roomId/cards/:cardId/vote')
  .put(roomsController.updateVote)
  .post(roomsController.vote);

roomRouter.route('/:id/quit').post(roomsController.quit);

app.use(`${BASE_URL}/v1/rooms`, roomRouter);

app.use('*', (_, res) => res.status(404).json({ msg: 'Resource not found' }));

server.listen(PORT, () => console.log(`> 🚀 Server running at ${PORT}`));
