import { WebSocketServer } from 'ws';
import { Game } from './models/game.js';
import { createRoom } from './controller/roomController.js';
import { Player } from './models/player.js';
var wss = new WebSocketServer({ port: 8080 });
var game = new Game();
function removePlayerFromRoom(ws) {
    var _loop_1 = function (roomCode) {
        var room = game.rooms[roomCode];
        Object.values(room.getPlayers()).forEach(function (player) {
            if (player.getWebSocket() == ws) {
                if (room.removePlayer(player)) {
                    //if the room in now empty, remove it from the game and return;
                    if (Object.keys(room.getPlayers()).length == 0) {
                        console.log('Removing empty room ' + room.getCode());
                        game.removeRoom(room);
                        return;
                    }
                    //notify all players about the new ready state
                    Object.values(room.getPlayers()).forEach(function (player) {
                        player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: room }));
                    });
                }
            }
        });
    };
    for (var roomCode in game.rooms) {
        _loop_1(roomCode);
    }
}
wss.on('connection', function connection(ws) {
    ws.on('message', function message(rawdata) {
        console.log('received: %s', rawdata);
        var message = JSON.parse(rawdata.toString());
        switch (message.type) {
            case 'BEGIN_GAME':
                var roomToBegin = game.rooms[message.roomCode];
                //if the room does not exist we exit and sent an error message to the client
                if (typeof roomToBegin == 'undefined') {
                    ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
                    break;
                }
                //begin the game
                roomToBegin.startGame();
                break;
            case 'CREATE_ROOM':
                var newRoom = createRoom(new Player(message.username, ws));
                game.addRoom(newRoom);
                console.log(newRoom);
                ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: newRoom }));
                break;
            case 'JOIN_ROOM':
                var room_1 = game.rooms[message.roomCode];
                //if the room does not exist we exit and sent an error message to the client
                if (typeof room_1 == 'undefined') {
                    ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
                    break;
                }
                //if the room does exist we add the player to it and send him the room info ONLY if the function returns true
                var addResult = room_1.addPlayer(new Player(message.username, ws));
                if (addResult == 3 /* addPlayerResult.SUCCESS */) {
                    ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: room_1 }));
                }
                else {
                    ws.send(JSON.stringify({ type: 'JOIN_FAIL', reason: addResult.toString }));
                    break;
                }
                //send new room data to all users in the room
                Object.values(room_1.getPlayers()).forEach(function (player) {
                    player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: room_1 }));
                });
                break;
            case 'PLAYER_DATA':
                var readyRoom_1 = game.rooms[message.roomCode];
                //if the room does not exist we exit and sent an error message to the client
                if (!readyRoom_1) {
                    ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
                    return;
                }
                //otherwise find the player in the room that sent the request and set his state to ready
                var player = readyRoom_1.getPlayers()[message.player.username];
                if (player) {
                    player.isReady = message.player.isReady;
                    player.color = message.player.color;
                }
                //notify all players about the new ready state
                Object.values(readyRoom_1.getPlayers()).forEach(function (player) {
                    player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: readyRoom_1 }));
                });
                break;
            case 'KEY_EVENT':
                var playRoom = game.rooms[message.roomCode];
                if (!playRoom) {
                    ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
                    return;
                }
                var keyPlayer = playRoom.getPlayers()[message.username];
                if (keyPlayer) {
                    keyPlayer.inputManager.handleInput(message.key, message.pressed === true);
                }
                break;
            case 'ERROR':
                console.error("Error: ".concat(message.message));
                break;
        }
    });
    ws.on('close', function () {
        removePlayerFromRoom(ws);
    });
    ws.send(JSON.stringify({ type: 'CONNECT_SUCCESSFULL' }));
});
setInterval(function () {
    for (var key in game.rooms) {
        if (game.rooms.hasOwnProperty(key)) {
            var room = game.rooms[key];
            //do not tick and broadcast gameplay to non running rooms
            if (room.gameState != 0 /* GameState.RUNNING */) {
                continue;
            }
            room.broadcastGameTickToPlayers();
            room.tick(1000 / 60 / 3);
        }
    }
}, 1000 / 100);
//# sourceMappingURL=server.js.map