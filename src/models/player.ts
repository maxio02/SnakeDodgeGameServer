import { WebSocket } from 'ws';
import Snake from './snake';
import InputManager from './inputManager.js';


export class Player {
    public username: string;
    public isReady: boolean;
    public color: string;
    private ws: WebSocket
    public snake: Snake;
    public inputManager: InputManager;
    constructor(username: string, ws: WebSocket, isReady: boolean = false) {
        this.username = username;
        this.ws = ws;
        this.isReady = isReady;
        
    }

    public getWebSocket(){
        return this.ws;
    }

    toJSON() {
        return {
          username: this.username,
          isReady: this.isReady,
          color: this.color
        };
      }

    public removeSnake() {
      this.snake = null;
    }


}