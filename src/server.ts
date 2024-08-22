import { WebSocketServer, WebSocket } from 'ws';
import { Game } from './models/game.js';
import { createRoom } from './controller/roomController.js';
import { Player } from './models/player.js';
import { GameState, Room, joinResult } from './models/room.js';
import { deflate } from 'pako';
import pkg from 'tasktimer';
const { TaskTimer } = pkg;
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const allowedOrigins = ['https://maxio.site', 'http://maxio.site'];

const wss = new WebSocketServer({
  port: port,
  verifyClient: (info, done) => {
    const origin = info.origin;
    if (allowedOrigins.includes(origin)) {
      done(true);
    } else {
      done(false, 403, 'Forbidden');
    }
  }
});
// const wss = new WebSocketServer({ port: port });

const game = new Game();



function removePlayerFromRoom(ws: WebSocket) {
  for (const roomCode in game.rooms) {
    const room = game.rooms[roomCode];

    Object.values(room.getPlayers()).forEach(player => {
      if (player.getWebSocket() == ws) {
        if (room.removePlayer(player)) {
          //if the room in now empty, remove it from the game and return;
          if (Object.keys(room.getPlayers()).length == 0) {
            game.removeRoom(room);
            return;
          }
          //notify all players about the new ready state
          Object.values(room.getPlayers()).forEach(player => {
            player.getWebSocket().send(deflate(JSON.stringify({ type: 'ROOM_DATA', room: room })));
          });
        }
      }
    })
  }
}


wss.on('connection', function connection(ws: WebSocket) {
  ws.on('message', function message(rawdata) {
    // console.log('received: %s', rawdata);
    ws.binaryType = 'arraybuffer';
    const message = JSON.parse(rawdata.toString());

    switch (message.type) {
      case 'BEGIN_GAME':
        let roomToBegin = game.rooms[message.roomCode];

        //if the room does not exist we exit and sent an error message to the client
        if (typeof roomToBegin == 'undefined') {
          ws.send(deflate(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' })));
          break;
        }
        //begin the game

        roomToBegin.startGame();
        break;
      case 'CREATE_ROOM':
        if(message.username.length > 15){
          ws.send(deflate(JSON.stringify({ type: 'JOIN_FAIL', reason: joinResult.INVALID_USERNAME })));
          break;
        }
          let newRoom = createRoom(new Player(message.username, ws));
          game.addRoom(newRoom);
          ws.send(deflate(JSON.stringify({ type: 'JOINED_ROOM', room: newRoom })));
        break;

      case 'JOIN_ROOM':
        let room = game.rooms[message.roomCode];

        //if the room does not exist we exit and sent an error message to the client
        if (typeof room == 'undefined') {
          ws.send(deflate(JSON.stringify({ type: 'JOIN_FAIL', reason: joinResult.ROOM_DOES_NOT_EXIST })));
          break;
        }

        if(message.username.length > 15){
          ws.send(deflate(JSON.stringify({ type: 'JOIN_FAIL', reason: joinResult.INVALID_USERNAME })));
          break;
        }

        //if the room does exist we add the player to it and send him the room info ONLY if the function returns true
        let addResult = room.addPlayer(new Player(message.username, ws));
        if (addResult == joinResult.SUCCESS) {
          ws.send(deflate(JSON.stringify({ type: 'JOINED_ROOM', room: room })));
        } else {
          ws.send(deflate(JSON.stringify({ type: 'JOIN_FAIL', reason: addResult})));
          break;
        }

        //send new room data to all users in the room
        Object.values(room.getPlayers()).forEach(player => {
          player.getWebSocket().send(deflate(JSON.stringify({ type: 'ROOM_DATA', room: room })))

        });
        break;

      case 'PLAYER_DATA':
        let readyRoom = game.rooms[message.roomCode];
        //if the room does not exist we exit and sent an error message to the client
        if (!readyRoom) {
          ws.send(deflate(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' })));
          return;
        }
        //otherwise find the player in the room that sent the request and set his state to ready
        let player = readyRoom.getPlayers()[message.player.username];
        if (player) {
          player.isReady = message.player.isReady;
          player.color = message.player.color;
        }

        //notify all players about the new ready state
        Object.values(readyRoom.getPlayers()).forEach(player => {
          player.getWebSocket().send(deflate(JSON.stringify({ type: 'ROOM_DATA', room: readyRoom })));
        });
        break;

      case 'KEY_EVENT':
        let playRoom = game.rooms[message.roomCode];

        if (!playRoom) {
          ws.send(deflate(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' })));
          return;
        }

        let keyPlayer = playRoom.getPlayers()[message.username];
        if (keyPlayer) {
          keyPlayer.inputManager.handleInput(message.key, message.pressed === true);
        }
        break;

        case 'ROOM_SETTINGS':
          let settingsRoom = game.rooms[message.roomCode];

          if (!settingsRoom) {
            ws.send(deflate(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' })));
            return;
          }
          settingsRoom.settings = message.settings;
        //notify all players about the new settings
        Object.values(settingsRoom.getPlayers()).forEach(player => {
          player.getWebSocket().send(deflate(JSON.stringify({ type: 'ROOM_DATA', room: settingsRoom })));
        });
        break;

      case 'ERROR':
        console.error(`Error: ${message.message}`);
        break;
    }
  });

  ws.on('close', () => {
    removePlayerFromRoom(ws);
  });

  ws.send(deflate(JSON.stringify({ type: 'CONNECT_SUCCESSFULL' })));
});

let timepassed = performance.now();

const tickRate = 1000 / 50; // Targeting 50 ticks per second

function gameLoop() {
  let timeNow = performance.now();
  let deltaTime = timeNow - timepassed;
  // console.log(deltaTime);
  timepassed = timeNow;

  for (const key in game.rooms) {
    if (game.rooms.hasOwnProperty(key)) {
      const room = game.rooms[key];
      //do not tick and broadcast gameplay to non running rooms
      if (room.gameState != GameState.RUNNING) {
        continue;
      }
      room.tick(deltaTime);
      room.broadcastGameTickToPlayers();
      
    }
  }
}

const timer = new TaskTimer(tickRate)

timer.on('tick', () => gameLoop());

timer.start();
