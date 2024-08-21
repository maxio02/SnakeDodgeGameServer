import { Vector } from "vector2d";
import { Player } from "./player.js";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
import InputManager from "./inputManager.js";
import CollisionHandler from "../controller/CollisionHandler.js";
import PowerupHandler from "../controller/powerupHandler.js";
import Powerup from './powerup';
import { deflate } from "pako";

export const enum GameState {
    RUNNING,
    IN_LOBBY,
    FINISHED
}

export const enum joinResult {
    ROOM_DOES_NOT_EXIST,
    ROOM_FULL,
    GAME_RUNNING,
    INVALID_USERNAME,
    SUCCESS

}

export interface RoomSettings {
    roomSize: number;
    maxPowerups: number;
    powerupInterval: number;
    selfCollision: boolean;
    arenaSize: number;
}

export class Room {

    private _players: { [key: string]: Player } = {};
    public settings: RoomSettings = {
        roomSize: 6,
        maxPowerups: 7,
        powerupInterval: 3,
        arenaSize: 2000,
        selfCollision: true
    };
    private _host: Player;
    private _code: string;
    public gameState: GameState = GameState.IN_LOBBY;
    private _collisionHandler: CollisionHandler;
    private _deadSnakesTimer: number = 0;
    private _playersToBeRemoved: Player[] = [];
    private _powerupHandler: PowerupHandler;
    private _tickCount = 0;
    private _isPaused = false;

    constructor(code: string, host: Player) {
        this._code = code;
        this._host = host;
        this.addPlayer(host);
    }

    public addPlayer(player: Player): joinResult {

        //do not allow players to join if the game is in progress
        if (this.gameState != GameState.IN_LOBBY) {
            return joinResult.GAME_RUNNING;
        }

        //if there is a player named the same also do not allow to join
        if (Object.values(this._players).some(p => p.username === player.username)) {
            return joinResult.INVALID_USERNAME;
        }

        //if the room is full also do not allow to join
        if (Object.keys(this._players).length >= this.settings.roomSize) {
            return joinResult.ROOM_FULL;
        }

        this._players[player.username] = player;
        return joinResult.SUCCESS;
    }

    public removePlayer(player: Player): boolean {

        //if the game is not in the in_lobby state instead of deleting the player add him to the queue to be deleted once the game finishes 
        if (this.gameState !== GameState.IN_LOBBY) {
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
            this.removePlayer(player);
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
            let startPos = new Vector(Math.random() * this.settings.arenaSize * 0.6 + this.settings.arenaSize * 0.2, Math.random() * this.settings.arenaSize * 0.6 + this.settings.arenaSize * 0.2);
            player.snake = new Snake(new LineSegment(startPos, startPos.add(new Vector(10, 10)), true, Math.random() * 2 * Math.PI));
            player.inputManager = new InputManager(player.snake);
        });

        this._collisionHandler = new CollisionHandler(Object.values(this.getPlayers()).map(player => player.snake), this.settings.arenaSize, this.settings.selfCollision);
        this._powerupHandler = new PowerupHandler(Object.values(this.getPlayers()), this.settings.powerupInterval * 1000, this.settings.maxPowerups, this._collisionHandler, this.settings.arenaSize);
        //inform the players back that the game has begun on the server-side
        this.broadcastGameStateToPlayers();

    }

    public endGame() {
        this.gameState = GameState.FINISHED;
        //inform the players back that the game has stopped on the server-side
        this.broadcastGameStateToPlayers();

        //reset the player snakes
        Object.values(this.getPlayers()).forEach(player => {
            player.removeSnake();
            player.isReady = false;
        });
        
        this._tickCount = 0;
        //TODO fix the entire resetting sequence
        this.gameState = GameState.IN_LOBBY;
        this.removeStagedPlayers();
        this.broadcastLobbyInfoToPlayers();
    }

    public broadcastGameTickToPlayers() {
        if(!this._isPaused){

        let snakeHeads = Object.values(this.getPlayers())
            .filter(player => player.snake.isAlive)
            .map(player => ({
                u: player.username,
                lS: player.snake.head.toMessageFormat(),
                sT: player.snake.head instanceof LineSegment ? 'L' : 'A'
            }))

        let powerupUpdate = this._powerupHandler.powerupUpdate;
        Object.values(this.getPlayers()).forEach(player => {
            //we want to broadcast only the snake heads and a bit to tell the client wheather to continue drawing the same segment or append a new segment
            player.getWebSocket().send(deflate(JSON.stringify({
                type: 'GD',
                s: snakeHeads,
                p: powerupUpdate
            })))
        });
        this._powerupHandler.resetUpdate()
    }
    }

    public broadcastLobbyInfoToPlayers() {
        Object.values(this.getPlayers()).forEach(player => {
            player.getWebSocket().send(deflate(JSON.stringify({ type: 'ROOM_DATA', room: this })))
        });
    }

    public broadcastGameStateToPlayers() {
        Object.values(this.getPlayers()).forEach(player => {
            player.getWebSocket().send(deflate(JSON.stringify({ type: 'GAME_STATE', state: this.gameState })))
        });
    }

    public tick(dt: number) {
        //a very dumb way to stop the server from ticking before the end of animation on the clint side
        //TODO think of a better solution
        if(this._tickCount === 0){
            this._isPaused = true;
            setTimeout(() => {
                this._isPaused = false;
                this._tickCount ++;
            }, 2200)
        }
        if(!this._isPaused){
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

        this._tickCount ++;
    }
    }

    toJSON() {
        return {
          gameState: this.gameState,
          code: this._code,
          host: this._host,
          players: this._players,
          settings: this.settings
        };
      }

}