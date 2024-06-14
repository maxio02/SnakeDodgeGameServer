var Room = /** @class */ (function () {
    function Room(code, host, maxSize) {
        if (maxSize === void 0) { maxSize = 5; }
        this.players = [];
        this.code = code;
        this.host = host;
        this.maxSize = maxSize;
        this.addPlayer(host);
    }
    Room.prototype.addPlayer = function (player) {
        if (this.players.length >= this.maxSize) {
            return false;
        }
        this.players.push(player);
        return true;
    };
    Room.prototype.getCode = function () {
        return this.code;
    };
    Room.prototype.getPlayers = function () {
        return this.players;
    };
    return Room;
}());
export { Room };
//# sourceMappingURL=room.js.map