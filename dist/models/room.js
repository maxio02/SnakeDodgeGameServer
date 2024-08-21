import { Vector } from "vector2d";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import InputManager from "./inputManager.js";
import CollisionHandler from "../controller/CollisionHandler.js";
import PowerupHandler from "../controller/powerupHandler.js";
import { deflate } from "pako";
var Room = /** @class */ (function () {
    function Room(code, host) {
        this._players = {};
        this.settings = {
            roomSize: 6,
            maxPowerups: 7,
            powerupInterval: 3,
            arenaSize: 2000,
            selfCollision: true
        };
        this.gameState = 1 /* GameState.IN_LOBBY */;
        this._deadSnakesTimer = 0;
        this._playersToBeRemoved = [];
        this._tickCount = 0;
        this._isPaused = false;
        this._code = code;
        this._host = host;
        this.addPlayer(host);
    }
    Room.prototype.addPlayer = function (player) {
        //do not allow players to join if the game is in progress
        if (this.gameState != 1 /* GameState.IN_LOBBY */) {
            return 2 /* joinResult.GAME_RUNNING */;
        }
        //if there is a player named the same also do not allow to join
        if (Object.values(this._players).some(function (p) { return p.username === player.username; })) {
            return 3 /* joinResult.INVALID_USERNAME */;
        }
        //if the room is full also do not allow to join
        if (Object.keys(this._players).length >= this.settings.roomSize) {
            return 1 /* joinResult.ROOM_FULL */;
        }
        this._players[player.username] = player;
        return 4 /* joinResult.SUCCESS */;
    };
    Room.prototype.removePlayer = function (player) {
        //if the game is not in the in_lobby state instead of deleting the player add him to the queue to be deleted once the game finishes 
        if (this.gameState !== 1 /* GameState.IN_LOBBY */) {
            this._playersToBeRemoved.push(player);
            return false;
        }
        else {
            // Remove the player from the players object
            delete this._players[player.username];
            // If the removed player was the host, assign a new host randomly
            if (player === this._host) {
                var playerKeys = Object.keys(this._players);
                if (playerKeys.length > 0) {
                    var randomIndex = Math.floor(Math.random() * playerKeys.length);
                    this._host = this._players[playerKeys[randomIndex]];
                }
                else {
                    this._host = null;
                }
            }
            return true;
        }
    };
    Room.prototype.removeStagedPlayers = function () {
        var _this = this;
        this._playersToBeRemoved.forEach(function (player) {
            _this.removePlayer(player);
        });
    };
    Room.prototype.getCode = function () {
        return this._code;
    };
    Room.prototype.getPlayers = function () {
        return this._players;
    };
    Room.prototype.getHost = function () {
        return this._host;
    };
    Room.prototype.startGame = function () {
        var _this = this;
        //change the game state
        this.gameState = 0 /* GameState.RUNNING */;
        //create all the snakes and InputManagers associated with players
        Object.values(this.getPlayers()).forEach(function (player) {
            var startPos = new Vector(Math.random() * _this.settings.arenaSize * 0.6 + _this.settings.arenaSize * 0.2, Math.random() * _this.settings.arenaSize * 0.6 + _this.settings.arenaSize * 0.2);
            player.snake = new Snake(new LineSegment(startPos, startPos.add(new Vector(10, 10)), true, Math.random() * 2 * Math.PI));
            player.inputManager = new InputManager(player.snake);
        });
        this._collisionHandler = new CollisionHandler(Object.values(this.getPlayers()).map(function (player) { return player.snake; }), this.settings.arenaSize, this.settings.selfCollision);
        this._powerupHandler = new PowerupHandler(Object.values(this.getPlayers()), this.settings.powerupInterval * 1000, this.settings.maxPowerups, this._collisionHandler, this.settings.arenaSize);
        //inform the players back that the game has begun on the server-side
        this.broadcastGameStateToPlayers();
    };
    Room.prototype.endGame = function () {
        this.gameState = 2 /* GameState.FINISHED */;
        //inform the players back that the game has stopped on the server-side
        this.broadcastGameStateToPlayers();
        //reset the player snakes
        Object.values(this.getPlayers()).forEach(function (player) {
            player.removeSnake();
            player.isReady = false;
        });
        this._tickCount = 0;
        //TODO fix the entire resetting sequence
        this.gameState = 1 /* GameState.IN_LOBBY */;
        this.removeStagedPlayers();
        this.broadcastLobbyInfoToPlayers();
    };
    Room.prototype.broadcastGameTickToPlayers = function () {
        if (!this._isPaused) {
            var snakeHeads_1 = Object.values(this.getPlayers())
                .filter(function (player) { return player.snake.isAlive; })
                .map(function (player) { return ({
                u: player.username,
                lS: player.snake.head.toMessageFormat(),
                sT: player.snake.head instanceof LineSegment ? 'L' : 'A'
            }); });
            var powerupUpdate_1 = this._powerupHandler.powerupUpdate;
            Object.values(this.getPlayers()).forEach(function (player) {
                //we want to broadcast only the snake heads and a bit to tell the client wheather to continue drawing the same segment or append a new segment
                player.getWebSocket().send(deflate(JSON.stringify({
                    type: 'GD',
                    s: snakeHeads_1,
                    p: powerupUpdate_1
                })));
            });
            this._powerupHandler.resetUpdate();
        }
    };
    Room.prototype.broadcastLobbyInfoToPlayers = function () {
        var _this = this;
        Object.values(this.getPlayers()).forEach(function (player) {
            player.getWebSocket().send(deflate(JSON.stringify({ type: 'ROOM_DATA', room: _this })));
        });
    };
    Room.prototype.broadcastGameStateToPlayers = function () {
        var _this = this;
        Object.values(this.getPlayers()).forEach(function (player) {
            player.getWebSocket().send(deflate(JSON.stringify({ type: 'GAME_STATE', state: _this.gameState })));
        });
    };
    Room.prototype.tick = function (dt) {
        var _this = this;
        //a very dumb way to stop the server from ticking before the end of animation on the clint side
        //TODO think of a better solution
        if (this._tickCount === 0) {
            this._isPaused = true;
            setTimeout(function () {
                _this._isPaused = false;
                _this._tickCount++;
            }, 2200);
        }
        if (!this._isPaused) {
            var allPlayersDied = Object.values(this.getPlayers()).every(function (player) { return !player.snake.isAlive; });
            if (allPlayersDied) {
                this._deadSnakesTimer += dt;
                if (this._deadSnakesTimer >= 600) {
                    this.endGame();
                    return;
                }
            }
            else {
                //reset this timer, gives future possibility of reviving snakes or something
                this._deadSnakesTimer = 0;
            }
            Object.values(this.getPlayers()).forEach(function (player) {
                player.snake.move(dt);
            });
            this._collisionHandler.checkCollisions();
            this._powerupHandler.tick(dt);
            this._powerupHandler.checkCollisions();
            this._tickCount++;
        }
    };
    Room.prototype.toJSON = function () {
        return {
            gameState: this.gameState,
            code: this._code,
            host: this._host,
            players: this._players,
            settings: this.settings
        };
    };
    return Room;
}());
export { Room };
//# sourceMappingURL=room.js.map