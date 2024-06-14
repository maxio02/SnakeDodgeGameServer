import { WebSocketServer, WebSocket } from 'ws';
import { Game } from './models/game.js';
import { createRoom } from './controller/roomController.js';
import { Player } from './models/player.js';
import { Room } from './models/room.js';


const wss = new WebSocketServer({ port: 8080 });
const game = new Game();

wss.on('connection', function connection(ws: WebSocket) {
  ws.on('message', function message(rawdata) {
    console.log('received: %s', rawdata);

    const message = JSON.parse(rawdata.toString());

    switch (message.type) {
      case 'CREATE_ROOM':
        let newRoom = createRoom(new Player(message.username, ws));
        game.addRoom(newRoom);

        console.log(newRoom);
        ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: newRoom }))
        break;

      case 'JOIN_ROOM':
        let room = game.rooms[message.roomCode];
        
        //if the room does not exist we exit and sent an error message to the client
        if (typeof room == 'undefined') {
          ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }))
        }

        //if the room does exist we add the player to it and send him the room info
        room.addPlayer(new Player(message.username, ws));
        ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: room }))

        //send new room data to all users in the room
        room.getPlayers().forEach(player => {
          player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: room }))

        });
        break;

      case 'SET_READY':
        let readyRoom = game.rooms[message.roomCode];
        if (!readyRoom) {
          ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
          return;
        }

        let player = readyRoom.getPlayers().find(p => p.username === message.username);
        if (player) {
          player.isReady = message.readyState;
        }
        readyRoom.getPlayers().forEach(player => {
          player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: readyRoom }))
        });
        break;

      case 'ERROR':
        alert(`Error: ${message.message}`);
        break;
    }
  });

  ws.send(JSON.stringify({ type: 'CONNECT_SUCCESSFULL' }));
});