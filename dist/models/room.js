import { Vector } from "vector2d";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import InputManager from "./inputManager.js";
import CollisionHandler from "../controller/CollisionHandler.js";
var Room = /** @class */ (function () {
    function Room(code, host, maxSize) {
        if (maxSize === void 0) { maxSize = 4; }
        this.players = {};
        this.gameState = 1 /* GameState.IN_LOBBY */;
        this.deadSnakesTimer = 0;
        this.playersToBeRemoved = [];
        this.code = code;
        this.host = host;
        this.maxSize = maxSize;
        this.addPlayer(host);
    }
    Room.prototype.addPlayer = function (player) {
        //do not allow players to join if the game is in progress
        if (this.gameState != 1 /* GameState.IN_LOBBY */) {
            return 1 /* addPlayerResult.GAME_RUNNING */;
        }
        //if there is a player named the same also do not allow to join
        if (Object.values(this.players).some(function (p) { return p.username === player.username; })) {
            return 2 /* addPlayerResult.PLAYER_ALREADY_EXISTS */;
        }
        //if the room is full also do not allow to join
        if (Object.keys(this.players).length >= this.maxSize) {
            return 0 /* addPlayerResult.ROOM_FULL */;
        }
        this.players[player.username] = player;
        return 3 /* addPlayerResult.SUCCESS */;
    };
    Room.prototype.removePlayer = function (player) {
        //if the game is not in the in_lobby state instead of deleting the player add him to the queue to be deleted once the game finishes 
        if (this.gameState != 1 /* GameState.IN_LOBBY */) {
            this.playersToBeRemoved.push(player);
            return false;
        }
        else {
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
        }
    };
    Room.prototype.removeStagedPlayers = function () {
        var _this = this;
        this.playersToBeRemoved.forEach(function (player) {
            delete _this.players[player.username];
        });
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
            var startPos = new Vector(Math.random() * 1200 + 400, Math.random() * 1200 + 400);
            player.snake = new Snake(new LineSegment(startPos, startPos.add(new Vector(10, 10)), true, Math.random() * 2 * Math.PI), player.color);
            player.inputManager = new InputManager(player.snake);
        });
        this.collisionHandler = new CollisionHandler(Object.values(this.getPlayers()).map(function (player) { return player.snake; }));
        //inform the players back that the game has begun on the server-side
        this.broadcastGameStateToPlayers();
    };
    Room.prototype.endGame = function () {
        this.gameState = 2 /* GameState.FINISHED */;
        this.removeStagedPlayers();
        //inform the players back that the game has stopped on the server-side
        this.broadcastGameStateToPlayers();
        //reset the player snakes
        Object.values(this.getPlayers()).forEach(function (player) {
            player.removeSnake();
            player.isReady = false;
        });
        this.broadcastLobbyInfoToPlayers();
        //TODO fix the entire resetting sequence
        this.gameState = 1 /* GameState.IN_LOBBY */;
    };
    Room.prototype.broadcastGameTickToPlayers = function () {
        var snakeHeads = Object.values(this.getPlayers())
            .filter(function (player) { return player.snake.isAlive; })
            .map(function (player) { return ({
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
        var allPlayersDied = Object.values(this.getPlayers()).every(function (player) { return !player.snake.isAlive; });
        if (allPlayersDied) {
            this.deadSnakesTimer += dt;
            if (this.deadSnakesTimer >= 600) {
                this.endGame();
                return;
            }
        }
        else {
            //reset this timer, gives future possibility of reviving snakes or something
            this.deadSnakesTimer = 0;
        }
        Object.values(this.getPlayers()).forEach(function (player) {
            player.snake.move(dt);
        });
        this.collisionHandler.checkCollisions();
    };
    return Room;
}());
export { Room };
//# sourceMappingURL=room.js.map