import { Vector } from "vector2d";
import { Player } from "./player.js";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
import InputManager from "./inputManager.js";

export const enum GameState {
    RUNNING,
    IN_LOBBY,
    FINISHED
}

export class Room {

    private players: {[key: string] : Player} = {};
    private maxSize: number;
    private host: Player;
    private code: string;
    public gameState: GameState = GameState.IN_LOBBY;



    constructor(code: string, host: Player, maxSize: number = 3) {
        this.code = code;
        this.host = host;
        this.maxSize = maxSize;
        this.addPlayer(host);
    }

    public addPlayer(player: Player): boolean {

        if (Object.keys(this.players).length >= this.maxSize) {
            return false;
        }

        this.players[player.username] = player;
        return true;
    }

    public removePlayer(player: Player): boolean {
        // Remove the player from the players object
        delete this.players[player.username];
    
        // If the removed player was the host, assign a new host randomly
        if (player === this.host) {
          let playerKeys = Object.keys(this.players);
          if (playerKeys.length > 0) {

            const randomIndex = Math.floor(Math.random() * playerKeys.length);
            
            this.host = this.players[playerKeys[randomIndex]];
          } else {
            this.host = null;
          }
        }
    
        return true;
      }

    public getCode() {
        return this.code;
    }

    public getPlayers(): { [key: string]: Player; } {
        return this.players;
    }

    public getHost(): Player {
        return this.host;
    }

    public startGame() {
        //change the game state
        this.gameState = GameState.RUNNING;

        //create all the snakes and InputManagers associated with players
        Object.values(this.getPlayers()).forEach(player => {
            let startPos = new Vector(Math.random() * 2000, Math.random() * 2000);
            player.snake = new Snake(new LineSegment(startPos, startPos.add(new Vector(10, 10)), true, Math.random() * 2 * Math.PI), player.color);
            player.inputManager = new InputManager(player.snake);
        });

        //inform the players back that the game has begun on the server-side
        this.broadcastGameStateToPlayers();

    }

    public endGame() {
        this.gameState = GameState.FINISHED;

        //inform the players back that the game has stopped on the server-side
        this.broadcastGameStateToPlayers();

        Object.values(this.getPlayers()).forEach(player => {
            player.snake = undefined;
        });
    }

    public broadcastGameTickToPlayers() {

        let snakeHeads = Object.values(this.getPlayers()).map(player => ({
            username: player.username,
            lastSegment: player.snake.head,
            segmentType: player.snake.head instanceof LineSegment ? 'LineSegment' : 'ArcSegment'
        }))
        

        Object.values(this.getPlayers()).forEach(player => {
            //we want to broadcast only the snake heads and a bit to tell the client wheather to continue drawing the same segment or append a new segment
            player.getWebSocket().send(JSON.stringify({
                type: 'GAMEPLAY_DATA',
                snakeHeads: snakeHeads

            }))
        });
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
        Object.values(this.getPlayers()).forEach(player => {
            player.snake.move(dt);
        });
    }
}