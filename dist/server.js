import { WebSocketServer } from 'ws';
import { Game } from './models/game.js';
import { createRoom } from './controller/roomController.js';
import { Player } from './models/player.js';
var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
var allowedOrigins = ['https://maxio.site', 'http://maxio.site'];
var wss = new WebSocketServer({
    port: port,
    verifyClient: function (info, done) {
        var origin = info.origin;
        if (allowedOrigins.includes(origin)) {
            done(true);
        }
        else {
            done(false, 403, 'Forbidden');
        }
    }
});
// const wss = new WebSocketServer({ port: port });
var game = new Game();
function removePlayerFromRoom(ws) {
    var _loop_1 = function (roomCode) {
        var room = game.rooms[roomCode];
        Object.values(room.getPlayers()).forEach(function (player) {
            if (player.getWebSocket() == ws) {
                if (room.removePlayer(player)) {
                    //if the room in now empty, remove it from the game and return;
                    if (Object.keys(room.getPlayers()).length == 0) {
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
        // console.log('received: %s', rawdata);
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
                ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: newRoom }));
                break;
            case 'JOIN_ROOM':
                var room_1 = game.rooms[message.roomCode];
                //if the room does not exist we exit and sent an error message to the client
                if (typeof room_1 == 'undefined') {
                    ws.send(JSON.stringify({ type: 'JOIN_FAIL', reason: 0 /* joinResult.ROOM_DOES_NOT_EXIST */ }));
                    break;
                }
                //if the room does exist we add the player to it and send him the room info ONLY if the function returns true
                var addResult = room_1.addPlayer(new Player(message.username, ws));
                if (addResult == 4 /* joinResult.SUCCESS */) {
                    ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: room_1 }));
                }
                else {
                    ws.send(JSON.stringify({ type: 'JOIN_FAIL', reason: addResult }));
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
var timepassed = performance.now();
var tickRate = 1000 / 70; // Targeting 60 ticks per second
function gameLoop() {
    var timeNow = performance.now();
    var deltaTime = timeNow - timepassed;
    // console.log(deltaTime);
    timepassed = timeNow;
    for (var key in game.rooms) {
        if (game.rooms.hasOwnProperty(key)) {
            var room = game.rooms[key];
            //do not tick and broadcast gameplay to non running rooms
            if (room.gameState != 0 /* GameState.RUNNING */) {
                continue;
            }
            room.broadcastGameTickToPlayers();
            room.tick(deltaTime);
        }
    }
    setTimeout(gameLoop, tickRate);
    // setImmediate(gameLoop);
}
gameLoop();
//# sourceMappingURL=server.js.map