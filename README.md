# hackaton-backend

REST API for our first Hackaton

## Models

**User**

```
{
  _id: String,
  name: String
}
```

**Card**

```
{
  _id: String,
  title: String,
  description: String,
  meta: Object<Any>
}
```

**Room**

```
{
  _id: String,
  code: String,
  owner: User,
  cards: Array<Card>
}
```

## /rooms

`POST /`  
description: Create a room  
body: `{ roomName: String, userName: String }`  
response: `{ room: Room, owner: User }`

`GET /:id`  
description: Get room info  
response: `{ room: Room }`

`POST /:id/config`  
description: Sets room config, only config for the moment is { sequence: Array<String> }  
body: `{ sequence: Array<String> }`

`POST /:id/cards`  
Add a list of cards to vote.  
body: `{ cards: Array<Card> }`

`DELETE /:roomId/cards/:cardId`  
description: Delete a card  
response: null

`POST /join/:roomCode`  
description: Allow a participant to join a room by its room code.  
body: `{ name: String }`  
response: User

`POST /:roomId/cards/:cardId/stage`  
description: Stage a card to voting  
body: `{}`  
response: null

`POST /:roomId/cards/:cardId/stage`  
description: Unstage a card from voting and finish the voting session  
body: `{}`  
response: null

`POST /:roomId/cards/:cardId/vote`  
description: Add a vote to a card  
body: `{ vote, userId }`  
response: null

`PUT /:roomId/cards/:cardId/vote`  
description: Update a vote in a card  
body: `{ vote, userId }`  
response: null

`POST /:id/quit`  
description: Allow users to exit the room. If the user leaving is the room owner, the room will be destroyed.  
body: `{ userId }`  
response: null

## Websocket

Websocket messages sent when some actions happen

**Room config updated**

message: `ROOM_CONFIG_UPDATED`  
envelope: `{ data: { roomId: room._id, config: { sequence } } }`

**New room participant**

message: `NEW_ROOM_PARTICIPANT`  
envelope: `{ data: { roomId: room._id, participant } }`

**New room cards**

message: `NEW_CARDS_ADDED`  
envelope: `{ data: { roomId: room._id, cards: updatedCards } }`

**Card staged to vote**

message: `CARD_STAGED_TO_VOTE`  
envelope: `{ data: { roomId, cardId } }`

**Card voted**

message: `CARD_VOTED`  
envelope: `{ data: { roomId, cardId, userId, vote } }`

**Vote session finished**

message: `VOTE_SESSION_FINISHED`  
envelope: `{ roomId, result: cards }`

**Vote updated**

message: `VOTE_UPDATED`  
envelope: `{ roomId, cardId, userId, newVote }`

**Vote updated**

message: `ROOM_DELETED`  
envelope: `{ data: { roomId: room._id } }`

**Delete card**

message: `CARD_DELETED`  
envelope: `{ data: { roomId, cardId } }`
