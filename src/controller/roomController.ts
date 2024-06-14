import { Player } from "../models/player.js";
import { Room } from "../models/room.js";

export function createRoom(player: Player){
    return new Room(generateRoomCode(), player);
}

function generateRoomCode() {
    let result = '';
    for (let i = 0; i < 5; i++) {
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += letter;
    }
    return result;
}