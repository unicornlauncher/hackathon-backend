# hackaton-backend

REST API for our first Hackaton

## rooms

`POST/`
body: { roomName: String, userName: String }

`GET /:id`
Returns the room info

`POST /:id/config`
Sets room config, only config for the moment is { sequence: Array<String> }
