import { Vector } from "vector2d";
import { Player } from "./player.js";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
import InputManager from "./inputManager.js";
import CollisionHandler from "../controller/CollisionHandler.js";
import PowerupHandler from "../controller/powerupHandler.js";

export const enum GameState {
    RUNNING,
    IN_LOBBY,
    FINISHED
}

export const enum addPlayerResult {
    ROOM_FULL,
    GAME_RUNNING,
    PLAYER_ALREADY_EXISTS,
    SUCCESS
}

export class Room {

    private _players: { [key: string]: Player } = {};
    private _maxSize: number;
    private _host: Player;
    private _code: string;
    public gameState: GameState = GameState.IN_LOBBY;
    private _collisionHandler: CollisionHandler;
    private _deadSnakesTimer: number = 0;
    private _playersToBeRemoved: Player[] = [];
    private _powerupHandler: PowerupHandler;

    constructor(code: string, host: Player, maxSize: number = 4) {
        this._code = code;
        this._host = host;
        this._maxSize = maxSize;
        this.addPlayer(host);
    }

    public addPlayer(player: Player): addPlayerResult {

        //do not allow players to join if the game is in progress
        if (this.gameState != GameState.IN_LOBBY) {
            return addPlayerResult.GAME_RUNNING;
        }

        //if there is a player named the same also do not allow to join
        if (Object.values(this._players).some(p => p.username === player.username)) {
            return addPlayerResult.PLAYER_ALREADY_EXISTS;
        }

        //if the room is full also do not allow to join
        if (Object.keys(this._players).length >= this._maxSize) {
            return addPlayerResult.ROOM_FULL;
        }

        this._players[player.username] = player;
        return addPlayerResult.SUCCESS;
    }

    public removePlayer(player: Player): boolean {

        //if the game is not in the in_lobby state instead of deleting the player add him to the queue to be deleted once the game finishes 
        if (this.gameState != GameState.IN_LOBBY) {
            this._playersToBeRemoved.push(player);
            return false;
        }
        else {
            // Remove the player from the players object
            delete this._players[player.username];

            // If the removed player was the host, assign a new host randomly
            if (player === this._host) {
                let playerKeys = Object.keys(this._players);
                if (playerKeys.length > 0) {

                    const randomIndex = Math.floor(Math.random() * playerKeys.length);

                    this._host = this._players[playerKeys[randomIndex]];
                } else {
                    this._host = null;
                }
            }

            return true;
        }

    }

    public removeStagedPlayers() {
        this._playersToBeRemoved.forEach(player => {
            delete this._players[player.username];
        })
    }

    public getCode() {
        return this._code;
    }

    public getPlayers(): { [key: string]: Player; } {
        return this._players;
    }

    public getHost(): Player {
        return this._host;
    }

    public startGame() {
        //change the game state
        this.gameState = GameState.RUNNING;

        //create all the snakes and InputManagers associated with players
        Object.values(this.getPlayers()).forEach(player => {
            let startPos = new Vector(Math.random() * 1200 + 400, Math.random() * 1200 + 400);
            player.snake = new Snake(new LineSegment(startPos, startPos.add(new Vector(10, 10)), true, Math.random() * 2 * Math.PI));
            player.inputManager = new InputManager(player.snake);
        });

        this._collisionHandler = new CollisionHandler(Object.values(this.getPlayers()).map(player => player.snake));
        this._powerupHandler = new PowerupHandler(Object.values(this.getPlayers()).map(player => player.snake), 200);
        //inform the players back that the game has begun on the server-side
        this.broadcastGameStateToPlayers();

    }

    public endGame() {
        this.gameState = GameState.FINISHED;
        this.removeStagedPlayers();

        //inform the players back that the game has stopped on the server-side
        this.broadcastGameStateToPlayers();

        //reset the player snakes
        Object.values(this.getPlayers()).forEach(player => {
            player.removeSnake();
            player.isReady = false;
        });
        this.broadcastLobbyInfoToPlayers();

        //TODO fix the entire resetting sequence
        this.gameState = GameState.IN_LOBBY;
    }

    public broadcastGameTickToPlayers() {

        let snakeHeads = Object.values(this.getPlayers())
            .filter(player => player.snake.isAlive)
            .map(player => ({
                username: player.username,
                lastSegment: player.snake.head,
                segmentType: player.snake.head instanceof LineSegment ? 'LineSegment' : 'ArcSegment'
            }))

        let powerupUpdate = this._powerupHandler.powerupUpdate;
        Object.values(this.getPlayers()).forEach(player => {
            //we want to broadcast only the snake heads and a bit to tell the client wheather to continue drawing the same segment or append a new segment
            player.getWebSocket().send(JSON.stringify({
                type: 'GAMEPLAY_DATA',
                snakeHeads: snakeHeads,
                powerUpInfo: powerupUpdate
            }))
        });
        this._powerupHandler.resetUpdate()
    }

    public broadcastLobbyInfoToPlayers() {
        Object.values(this.getPlayers()).forEach(player => {
            player.getWebSocket().send(JSON.stringify({ type: 'ROOM_DATA', room: this }))
        });
    }

    public broadcastGameStateToPlayers() {
        Object.values(this.getPlayers()).forEach(player => {
            player.getWebSocket().send(JSON.stringify({ type: 'GAME_STATE', state: this.gameState }))
        });
    }

    public tick(dt: number) {
        let allPlayersDied = Object.values(this.getPlayers()).every(player => !player.snake.isAlive);

        if (allPlayersDied) {
            this._deadSnakesTimer += dt;
            if (this._deadSnakesTimer >= 600) {
                this.endGame();
                return;
            }
        } else {
            //reset this timer, gives future possibility of reviving snakes or something
            this._deadSnakesTimer = 0;
        }
        Object.values(this.getPlayers()).forEach(player => {
            player.snake.move(dt);
        });
        this._collisionHandler.checkCollisions()
        this._powerupHandler.tick(dt);
        this._powerupHandler.checkCollisions();
    }

    toJSON() {
        return {
          gameState: this.gameState,
          code: this._code,
          host: this._host,
          players: this._players,
          maxSize: this._maxSize
        };
      }

}