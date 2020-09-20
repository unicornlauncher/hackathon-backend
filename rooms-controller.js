const { RoomCodeGenerator } = require('./room-code-generator');

const internalServerError = res => res.status(500).json({ msg: 'Oops' });

class RoomsController {
  constructor(props) {
    this.props = props;

    this.create = this.create.bind(this);
    this.get = this.get.bind(this);
    this.setConfig = this.setConfig.bind(this);
    this.addCards = this.addCards.bind(this);
    this.stageCardToVote = this.stageCardToVote.bind(this);
    this.join = this.join.bind(this);
    this.unstageCardFromVoting = this.unstageCardFromVoting.bind(this);
    this.updateVote = this.updateVote.bind(this);
    this.vote = this.vote.bind(this);
    this.quit = this.quit.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
  }

  async create(req, res) {
    const { memory, uuid } = this.props;
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
  }

  async get(req, res) {
    const { memory } = this.props;
    try {
      const room = await memory.get(req.params.id);
      return res.json(room);
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async setConfig(req, res) {
    const { memory, io } = this.props;
    try {
      const { sequence } = req.body;
      const room = await memory.get(req.params.id);
      const updated = { ...room, sequence };
      await memory.set(room._id, updated);
      io.sockets.emit('ROOM_CONFIG_UPDATED', {
        data: { roomId: room._id, config: { sequence } },
      });
      return res.json(updated);
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async addCards(req, res) {
    const { memory, io, uuid } = this.props;

    try {
      const { cards } = req.body;
      const updatedCards = cards.map(c => ({ ...c, _id: uuid() }));
      const room = await memory.get(req.params.id);
      const updated = {
        ...room,
        cards: [...(room.cards || []), ...updatedCards],
      };

      await memory.set(room._id, updated);
      io.sockets.emit('NEW_CARDS_ADDED', {
        data: { roomId: room._id, cards: updatedCards },
      });

      return res.status(201).json(updated);
    } catch (err) {
      console.log(err);
      return internalServerError(res);
    }
  }

  async deleteCard(req, res) {
    const { memory, io } = this.props;
    const { roomId, cardId } = req.params;

    try {
      const room = await memory.get(roomId);
      const updated = {
        ...room,
        cards: room.cards.filter(card => card._id !== cardId),
      };

      await memory.set(room._id, updated);
      io.sockets.emit('CARD_DELETED', { data: { roomId, cardId } });
      return res.status(204).end();
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async stageCardToVote(req, res) {
    const { memory, io } = this.props;
    try {
      const { cardId, roomId } = req.params;

      const room = await memory.get(roomId);
      const updated = {
        ...room,
        cards: room.cards.map(card =>
          card._id === cardId ? { ...card, staged: true, votes: [] } : card
        ),
      };

      await memory.set(room._id, updated);

      io.sockets.emit('CARD_STAGED_TO_VOTE', { data: { roomId, cardId } });

      return res.status(204).end();
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async join(req, res) {
    const { memory, io, uuid } = this.props;

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

      const participant = { name, _id: uuid() };
      await memory.set(room._id, {
        ...room,
        participants: [...room.participants, participant],
      });

      io.sockets.emit('NEW_ROOM_PARTICIPANT', {
        data: { roomId: room._id, participant },
      });

      return res.json(room);
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async unstageCardFromVoting(req, res) {
    const { memory, io } = this.props;
    try {
      const { cardId, roomId } = req.params;
      const room = await memory.get(roomId);
      const updated = {
        ...room,
        cards: room.cards.map(card =>
          card._id === cardId ? { ...card, staged: false, voted: true } : card
        ),
      };

      await memory.set(room._id, updated);
      io.sockets.emit('VOTE_SESSION_FINISHED', {
        data: { roomId, result: updated.cards },
      });

      return res.status(204).end();
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async updateVote(req, res) {
    const { cardId, roomId } = req.params;
    const { userId, vote: newVote } = req.body;

    const room = await memory.get(roomId);
    const updated = {
      ...room,
      cards: room.cards.map(card =>
        card._id === cardId
          ? {
              ...card,
              votes: card.votes.map(vote =>
                vote.userId === userId ? { ...vote, newVote } : vote
              ),
            }
          : card
      ),
    };

    await memory.set(room._id, updated);
    io.sockets.emit('VOTE_UPDATED', {
      data: { roomId, cardId, userId, newVote },
    });

    return res.status(204).end();
  }

  async vote(req, res) {
    try {
      const { cardId, roomId } = req.params;
      const { vote, userId } = req.body;
      const room = await memory.get(roomId);
      const updated = {
        ...room,
        cards: room.cards.map(card =>
          card._id === cardId
            ? { ...card, votes: [...card.votes, { vote, userId }] }
            : card
        ),
      };

      await memory.set(room._id, updated);
      io.sockets.emit('CARD_VOTED', { data: { roomId, cardId, userId, vote } });

      return res.status(204).end();
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }

  async quit(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const { memory } = this.props;

      const room = await memory.get(id);
      if (room.owner._id === userId) {
        memory.del(room._id);
      }

      io.sockets.emit('ROOM_DELETED', { data: { roomId: room._id } });
      return res.status(204).end();
    } catch (ex) {
      console.log(ex);
      return internalServerError(res);
    }
  }
}

module.exports = { RoomsController };
