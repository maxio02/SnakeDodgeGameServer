import { Vector } from "vector2d";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import InputManager from "./inputManager.js";
var Room = /** @class */ (function () {
    function Room(code, host, maxSize) {
        if (maxSize === void 0) { maxSize = 3; }
        this.players = {};
        this.gameState = 1 /* GameState.IN_LOBBY */;
        this.code = code;
        this.host = host;
        this.maxSize = maxSize;
        this.addPlayer(host);
    }
    Room.prototype.addPlayer = function (player) {
        if (Object.keys(this.players).length >= this.maxSize) {
            return false;
        }
        this.players[player.username] = player;
        return true;
    };
    Room.prototype.removePlayer = function (player) {
        // Remove the player from the players object
        delete this.players[player.username];
        // If the removed player was the host, assign a new host randomly
        if (player === this.host) {
            var playerKeys = Object.keys(this.players);
            if (playerKeys.length > 0) {
                var randomIndex = Math.floor(Math.random() * playerKeys.length);
                this.host = this.players[playerKeys[randomIndex]];
            }
            else {
                this.host = null;
            }
        }
        return true;
    };
    Room.prototype.getCode = function () {
        return this.code;
    };
    Room.prototype.getPlayers = function () {
        return this.players;
    };
    Room.prototype.getHost = function () {
        return this.host;
    };
    Room.prototype.startGame = function () {
        //change the game state
        this.gameState = 0 /* GameState.RUNNING */;
        //create all the snakes and InputManagers associated with players
        Object.values(this.getPlayers()).forEach(function (player) {
            var startPos = new Vector(Math.random() * 2000, Math.random() * 2000);
            player.snake = new Snake(new LineSegment(startPos, startPos.add(new Vector(10, 10)), true, Math.random() * 2 * Math.PI), player.color);
            player.inputManager = new InputManager(player.snake);
        });
        //inform the players back that the game has begun on the server-side
        this.broadcastGameStateToPlayers();
    };
    Room.prototype.endGame = function () {
        this.gameState = 2 /* GameState.FINISHED */;
        //inform the players back that the game has stopped on the server-side
        this.broadcastGameStateToPlayers();
        Object.values(this.getPlayers()).forEach(function (player) {
            player.snake = undefined;
        });
    };
    Room.prototype.broadcastGameTickToPlayers = function () {
        var snakeHeads = Object.values(this.getPlayers()).map(function (player) { return ({
            username: player.username,
            lastSegment: player.snake.head,
            segmentType: player.snake.head instanceof LineSegment ? 'LineSegment' : 'ArcSegment'
        }); });
        Object.values(this.getPlayers()).forEach(function (player) {
            //we want to broadcast only the snake heads and a bit to tell the client wheather to continue drawing the same segment or append a new segment
            player.getWebSocket().send(JSON.stringify({
                type: 'GAMEPLAY_DATA',
                snakeHeads: snakeHeads
            }));
        });
    };
    Room.prototype.broadcastLobbyInfoToPlayers = function () {
        var _this = this;
        Object.values(this.getPlayers()).forEach(function (player) {
            player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: _this }));
        });
    };
    Room.prototype.broadcastGameStateToPlayers = function () {
        var _this = this;
        Object.values(this.getPlayers()).forEach(function (player) {
            player.getWebSocket().send(JSON.stringify({ type: 'GAME_STATE', state: _this.gameState }));
        });
    };
    Room.prototype.tick = function (dt) {
        Object.values(this.getPlayers()).forEach(function (player) {
            player.snake.move(dt);
        });
    };
    return Room;
}());
export { Room };
//# sourceMappingURL=room.js.map