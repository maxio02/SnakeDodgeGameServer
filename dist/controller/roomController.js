import { Room } from "../models/room.js";
export function createRoom(player) {
    return new Room(generateRoomCode(), player);
}
function generateRoomCode() {
    var result = '';
    for (var i = 0; i < 5; i++) {
        var letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += letter;
    }
    return result;
}
//# sourceMappingURL=roomController.js.map