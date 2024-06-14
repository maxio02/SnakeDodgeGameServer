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
    Room.prototype.removePlayer = function (player) {
        var index = this.players.indexOf(player);
        if (index === -1) {
            return false;
        }
        this.players.splice(index, 1);
        // If the removed player was the host, assign a new host
        if (player === this.host) {
            if (this.players.length > 0) {
                this.host = this.players[Math.floor(Math.random() * this.players.length)];
            }
            else {
                this.host = null;
            }
        }
        return true;
    };
    Room.prototype.getCode = function () {
        return this.code;
    };
    Room.prototype.getPlayers = function () {
        return this.players;
    };
    Room.prototype.getHost = function () {
        return this.host;
    };
    return Room;
}());
export { Room };
//# sourceMappingURL=room.js.map