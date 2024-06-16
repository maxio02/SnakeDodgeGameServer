import { Room } from "./room.js";

export class Game {
    public rooms: {[key: string] : Room};

    constructor() {
        this.rooms = {};
    }

    addRoom(room: Room){
        this.rooms[room.getCode()] = room;
    }

    removeRoom(room: Room){
        delete this.rooms[room.getCode()]
    }
    
}


