var Game = /** @class */ (function () {
    function Game() {
        this.status = 1 /* GameState.WAITING */;
        this.rooms = {};
    }
    Game.prototype.addRoom = function (room) {
        this.rooms[room.getCode()] = room;
    };
    Game.prototype.removeRoom = function (room) {
    };
    return Game;
}());
export { Game };
//# sourceMappingURL=game.js.map