import { Player } from "./player.js";

export class Room {
    private players: Player[] = [];
    private maxSize: number;
    private host: Player;
    private code: string;

    constructor(code: string, host: Player, maxSize: number = 5) {
        this.code = code;
        this.host = host;
        this.maxSize = maxSize;
        this.addPlayer(host);
    }

    public addPlayer(player: Player): boolean{

        if (this.players.length >= this.maxSize){
            return false;
        }

        this.players.push(player)
        return true;
    }

    public removePlayer(player: Player): boolean{
        const index = this.players.indexOf(player);
        if (index === -1) {
            return false;
        }

        this.players.splice(index, 1);

        // If the removed player was the host, assign a new host
        if (player === this.host) {
            if (this.players.length > 0) {
                this.host = this.players[Math.floor(Math.random() * this.players.length)];
            } else {
                this.host = null;
            }
        }

        return true;
    }

    public getCode(){
        return this.code;
    }

    public getPlayers(): Player[]{
        return this.players;
    }

    public getHost(): Player {
        return this.host;
    }
}