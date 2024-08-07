var Game = /** @class */ (function () {
    function Game() {
        this.rooms = {};
    }
    Game.prototype.addRoom = function (room) {
        this.rooms[room.getCode()] = room;
    };
    Game.prototype.removeRoom = function (room) {
        delete this.rooms[room.getCode()];
    };
    return Game;
}());
export { Game };
//# sourceMappingURL=game.js.map