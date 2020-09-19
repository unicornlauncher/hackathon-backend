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
