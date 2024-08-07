var Player = /** @class */ (function () {
    function Player(username, ws, isReady) {
        if (isReady === void 0) { isReady = false; }
        this.username = username;
        this.ws = ws;
        this.isReady = isReady;
    }
    Player.prototype.getWebSocket = function () {
        return this.ws;
    };
    Player.prototype.toJSON = function () {
        return {
            username: this.username,
            isReady: this.isReady,
            color: this.color
        };
    };
    Player.prototype.removeSnake = function () {
        this.snake = null;
    };
    return Player;
}());
export { Player };
//# sourceMappingURL=player.js.map