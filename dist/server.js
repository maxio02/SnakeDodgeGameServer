import { WebSocketServer } from 'ws';
import { Game } from './models/game.js';
import { createRoom } from './controller/roomController.js';
import { Player } from './models/player.js';
var wss = new WebSocketServer({ port: 8080 });
var game = new Game();
wss.on('connection', function connection(ws) {
    ws.on('message', function message(rawdata) {
        console.log('received: %s', rawdata);
        var message = JSON.parse(rawdata.toString());
        switch (message.type) {
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
                }
                //if the room does exist we add the player to it and send him the room info
                room_1.addPlayer(new Player(message.username, ws));
                ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: room_1 }));
                //send new room data to all users in the room
                room_1.getPlayers().forEach(function (player) {
                    player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: room_1 }));
                });
                break;
            case 'SET_READY':
                var readyRoom_1 = game.rooms[message.roomCode];
                if (!readyRoom_1) {
                    ws.send(JSON.stringify({ type: 'ROOM_DOES_NOT_EXIST' }));
                    return;
                }
                var player = readyRoom_1.getPlayers().find(function (p) { return p.username === message.username; });
                if (player) {
                    player.isReady = message.readyState;
                }
                readyRoom_1.getPlayers().forEach(function (player) {
                    player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: readyRoom_1 }));
                });
                break;
            case 'ERROR':
                alert("Error: ".concat(message.message));
                break;
        }
    });
    ws.send(JSON.stringify({ type: 'CONNECT_SUCCESSFULL' }));
});
//# sourceMappingURL=server.js.map