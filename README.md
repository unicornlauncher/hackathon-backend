# hackaton-backend

REST API for our first Hackaton

## rooms

`POST/`
body: { roomName: String, userName: String }

`GET /:id`
Returns the room info

`POST /:id/config`
Sets room config, only config for the moment is { sequence: Array<String> }

`POST /:id/cards`
Add a list of cards to vote. Body: { cards: Array<Card> }, where Card: { title: String, description: String, meta: Object }

## Websocket
Websocket messages sent when some actions happen

### Room config updated
message: `ROOM_CONFIG_UPDATED`
envelope: `{ data: { roomId: room._id, config: { sequence } } }`

### New room participant
message: `NEW_ROOM_PARTICIPANT`
envelope: `{ data: { roomId: room._id, participant } }`

### New room cards
message: `NEW_CARDS_ADDED`
envelope: `{ data: { roomId: room._id, cards: updatedCards } }`

### Card staged to vote
message: `CARD_STAGED_TO_VOTE`
envelope: `{ data: { roomId, cardId } }`

### Card voted
message: `CARD_VOTED`
envelope: `{ data: { roomId, cardId, userId, vote } }`

