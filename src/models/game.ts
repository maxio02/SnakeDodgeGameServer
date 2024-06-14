import { Room } from "./room.js";

const enum GameState {
    RUNNING,
    WAITING,
    FINISHED
}

export class Game {
    public rooms: {[key: string] : Room};
    private status: GameState = GameState.WAITING;

    constructor() {
        this.rooms = {};
    }

    addRoom(room: Room){
        this.rooms[room.getCode()] = room;
    }

    removeRoom(room: Room){
        
    }
    
}


