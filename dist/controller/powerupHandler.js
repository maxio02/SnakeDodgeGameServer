import { Vector } from "vector2d";
import Powerup, { PowerupType } from "../models/powerup.js";
var PowerupHandler = /** @class */ (function () {
    function PowerupHandler(players, avgTimeBetweenPowerups, maxPowerupAmount, collisionHandler, arenaSize) {
        this._timeToNextPowerupSpawn = 10;
        this._powerups = {};
        this._powerupUpdate = [];
        this._players = players;
        this._avgTimeBetweenPowerUps = avgTimeBetweenPowerups;
        this._powerupCounter = 0;
        this._collisionHandler = collisionHandler;
        this._maxPowerupAmount = maxPowerupAmount;
        this._powerupUpdate = [];
        this.arenaSize = arenaSize;
    }
    PowerupHandler.prototype.tick = function (dt) {
        if (this._timeToNextPowerupSpawn < 0 &&
            Object.keys(this._powerups).length < this._maxPowerupAmount) {
            this._timeToNextPowerupSpawn =
                Math.random() * this._avgTimeBetweenPowerUps * 2; //TODO add min amount probs
            var powerupType = this.getRandomPowerupType();
            var powerupDuration = 0;
            switch (powerupType) {
                case PowerupType.PortalWalls:
                    powerupDuration = 10000;
                    break;
                case PowerupType.CameraLockToPlayer:
                    powerupDuration = 15000;
                    break;
                default:
                    powerupDuration = 0;
                    break;
            }
            this.addPowerup(new Powerup(this._powerupCounter, new Vector(Math.random() * this.arenaSize * 0.9 + this.arenaSize * 0.05, Math.random() * this.arenaSize * 0.9 + this.arenaSize * 0.05), "#000000".replace(/0/g, function () {
                return (~~(Math.random() * 14)).toString(16);
            }), powerupType, powerupDuration));
            this._powerupCounter++;
        }
        if (Object.keys(this._powerups).length < this._maxPowerupAmount) {
            this._timeToNextPowerupSpawn -= dt;
        }
    };
    PowerupHandler.prototype.addPowerup = function (powerup) {
        this._powerupUpdate.push({
            action: 1 /* PowerupAction.SPAWN */,
            powerup: powerup,
            player: null,
        });
        this._powerups[powerup.id] = powerup;
    };
    PowerupHandler.prototype.removePowerup = function (powerup) {
        this._powerupUpdate.push({
            action: 0 /* PowerupAction.REMOVE */,
            powerup: powerup,
            player: null,
        });
        delete this._powerups[powerup.id];
    };
    PowerupHandler.prototype.resetUpdate = function () {
        this._powerupUpdate = [];
    };
    Object.defineProperty(PowerupHandler.prototype, "powerupUpdate", {
        get: function () {
            return this._powerupUpdate;
        },
        enumerable: false,
        configurable: true
    });
    PowerupHandler.prototype.getRandomPowerupType = function () {
        var powerupTypes = Object.values(PowerupType).filter(function (value) { return typeof value === "number"; });
        var randomIndex = Math.floor(Math.random() * powerupTypes.length);
        return powerupTypes[randomIndex];
    };
    PowerupHandler.prototype.isPointInCircle = function (center, radius, point, epsilon) {
        var distance = point.distance(center);
        if (Math.abs(distance - radius) > epsilon) {
            return false;
        }
        else {
            return true;
        }
    };
    PowerupHandler.prototype.checkCollisions = function () {
        var _this = this;
        this._players.forEach(function (player) {
            var snake = player.snake;
            //if the snake is dead ignore it
            if (!snake.isAlive)
                return;
            //Check the powerup collisions
            Object.values(_this._powerups).forEach(function (powerup) {
                if (_this.isPointInCircle(powerup.position, powerup.radius, snake.head.endPoint, 5)) {
                    switch (powerup.type) {
                        case PowerupType.PortalWalls:
                            if (_this._wrapWallsTimeoutId) {
                                clearTimeout(_this._wrapWallsTimeoutId);
                            }
                            if (_this._collisionHandler.wrapWalls === false) {
                                _this._collisionHandler.wrapWalls = true;
                                _this._powerupUpdate.push({
                                    action: 2 /* PowerupAction.APPLY */,
                                    powerup: powerup,
                                    player: player,
                                });
                            }
                            // Schedule the wrapWalls to be set to false after the powerup duration
                            _this._wrapWallsTimeoutId = setTimeout(function () {
                                _this._collisionHandler.wrapWalls = false;
                                _this._powerupUpdate.push({
                                    action: 2 /* PowerupAction.APPLY */,
                                    powerup: powerup,
                                    player: player,
                                });
                            }, powerup.duration);
                            break;
                        case PowerupType.CameraLockToPlayer:
                            _this._powerupUpdate.push({
                                action: 2 /* PowerupAction.APPLY */,
                                powerup: powerup,
                                player: player,
                            });
                            break;
                        default:
                            snake.applyPowerup(powerup);
                            break;
                    }
                    _this.removePowerup(powerup);
                }
            });
        });
    };
    return PowerupHandler;
}());
export default PowerupHandler;
//# sourceMappingURL=powerupHandler.js.map