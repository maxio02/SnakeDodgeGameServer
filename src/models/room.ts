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

    public getCode(){
        return this.code;
    }

    public getPlayers(): Player[]{
        return this.players;
    }
}