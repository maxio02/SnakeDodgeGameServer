import { WebSocketServer, WebSocket } from 'ws';
import { Game } from './models/game.js';
import { createRoom } from './controller/roomController.js';
import { Player } from './models/player.js';
import { GameState, Room, addPlayerResult } from './models/room.js';


const wss = new WebSocketServer({ port: 8080 });
const game = new Game();

function removePlayerFromRoom(ws: WebSocket) {
  for (const roomCode in game.rooms) {
    const room = game.rooms[roomCode];

    Object.values(room.getPlayers()).forEach(player => {
      if (player.getWebSocket() == ws) {
        if (room.removePlayer(player)) {
          //if the room in now empty, remove it from the game and return;
          if (Object.keys(room.getPlayers()).length == 0) {
            console.log('Removing empty room ' + room.getCode());
            game.removeRoom(room);
            return;
          }
          //notify all players about the new ready state
          Object.values(room.getPlayers()).forEach(player => {
            player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: room }))
          });
        }
      }
    })
  }
}


wss.on('connection', function connection(ws: WebSocket) {
  ws.on('message', function message(rawdata) {
    console.log('received: %s', rawdata);

    const message = JSON.parse(rawdata.toString());

    switch (message.type) {
      case 'BEGIN_GAME':
        let roomToBegin = game.rooms[message.roomCode];

        //if the room does not exist we exit and sent an error message to the client
        if (typeof roomToBegin == 'undefined') {
          ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }))
          break;
        }
        //begin the game

        roomToBegin.startGame();
        break;
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
          break;
        }

        //if the room does exist we add the player to it and send him the room info ONLY if the function returns true
        let addResult = room.addPlayer(new Player(message.username, ws));
        if (addResult == addPlayerResult.SUCCESS) {
          ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: room }))
        } else {
          ws.send(JSON.stringify({ type: 'JOIN_FAIL', reason: addResult.toString}))
          break;
        }

        //send new room data to all users in the room
        Object.values(room.getPlayers()).forEach(player => {
          player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: room }))

        });
        break;

      case 'PLAYER_DATA':
        let readyRoom = game.rooms[message.roomCode];
        //if the room does not exist we exit and sent an error message to the client
        if (!readyRoom) {
          ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
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
          player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: readyRoom }))
        });
        break;

      case 'KEY_EVENT':
        let playRoom = game.rooms[message.roomCode];

        if (!playRoom) {
          ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
          return;
        }

        let keyPlayer = playRoom.getPlayers()[message.username];
        if (keyPlayer) {
          keyPlayer.inputManager.handleInput(message.key, message.pressed === true);
        }
        break;

      case 'ERROR':
        console.error(`Error: ${message.message}`);
        break;
    }
  });

  ws.on('close', () => {
    removePlayerFromRoom(ws);
  });

  ws.send(JSON.stringify({ type: 'CONNECT_SUCCESSFULL' }));
});

let timepassed = performance.now();

const tickRate = 1000 / 100; // Targeting 60 ticks per second

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
      room.broadcastGameTickToPlayers();
      room.tick(tickRate / 3); //TODO give actual time
    }
  }

  setTimeout(gameLoop, tickRate)

  // setImmediate(gameLoop);
}

gameLoop()