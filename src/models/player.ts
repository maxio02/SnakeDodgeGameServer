import { WebSocket } from 'ws';


export class Player {
    public username: string;
    public isReady: boolean;
    public color: string;
    private ws: WebSocket
    constructor(username: string, ws: WebSocket, isReady: boolean = false) {
        this.username = username;
        this.ws = ws;
        this.isReady = isReady;
    }

    getWebSocket(){
        return this.ws;
    }

    toJSON() {
        return {
          username: this.username,
          isReady: this.isReady,
          color: this.color
        };
      }

}