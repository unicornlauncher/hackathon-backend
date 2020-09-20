# hackaton-backend

REST API for our first Hackaton

## rooms (/rooms)

`POST /`
Create a room
body: `{ roomName: String, userName: String }`

`GET /:id`
Returns the room info

`POST /:id/config`
Sets room config, only config for the moment is { sequence: Array<String> }
Body: `{ sequence: Array<String> }`

`POST /:id/cards`
Add a list of cards to vote.
Body: `{ cards: Array<Card> }, where Card: { title: String, description: String, meta: Object }`

`DELETE /:roomId/cards/:cardId`
Delete a card

`POST /join/:roomCode`
Allow a participant to join a room by its room code.
Body: `{ name: String }`

`POST /:roomId/cards/:cardId/stage`
Stage a card to voting
Body: `{}`

`POST /:roomId/cards/:cardId/stage`
Unstage a card from voting and finish the voting session
Body: `{}`

`POST /:roomId/cards/:cardId/vote`
Add a vote to a card
Body: `{ vote, userId }`

`PUT /:roomId/cards/:cardId/vote`
Update a vote in a card
Body: `{ vote, userId }`

`POST /:id/quit`
Allow users to exit the room. If the user leaving is the room owner, the room will be destroyed.
Body: `{ userId }`

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

### Vote session finished

message: `VOTE_SESSION_FINISHED`
envelope: `{ roomId, result: cards }`

### Vote updated

message: `VOTE_UPDATED`
envelope: `{ roomId, cardId, userId, newVote }`

### Vote updated

message: `ROOM_DELETED`
envelope: `{ data: { roomId: room._id } }`

### Delete card

message: `CARD_DELETED`
envelope: `{ data: { roomId, cardId } }`
