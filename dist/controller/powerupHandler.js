import { Vector } from "vector2d";
import Powerup, { PowerupType } from "../models/powerup.js";
import seedrandom from "seedrandom";
import Zone from "../models/zone.js";
var PowerupHandler = /** @class */ (function () {
    function PowerupHandler(players, avgTimeBetweenPowerups, maxPowerupAmount, collisionHandler, arenaSize) {
        this._timeToNextPowerupSpawn = 10;
        this._powerups = {};
        this._effectZones = {};
        this._powerupUpdate = [];
        this._players = players;
        this._avgTimeBetweenPowerUps = avgTimeBetweenPowerups;
        this._collisionHandler = collisionHandler;
        this._maxPowerupAmount = maxPowerupAmount;
        this._powerupUpdate = [];
        this.arenaSize = arenaSize;
    }
    PowerupHandler.prototype.tick = function (dt) {
        var _this = this;
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
            this.addPowerup(new Powerup(Math.floor(Math.random() * 1000000), new Vector(Math.random() * this.arenaSize * 0.9 + this.arenaSize * 0.05, Math.random() * this.arenaSize * 0.9 + this.arenaSize * 0.05), "#000000".replace(/0/g, function () {
                return (~~(Math.random() * 14)).toString(16);
            }), powerupType, powerupDuration));
        }
        if (Object.keys(this._powerups).length < this._maxPowerupAmount) {
            this._timeToNextPowerupSpawn -= dt;
        }
        Object.keys(this._effectZones).forEach(function (key) {
            var zone = _this._effectZones[Number(key)];
            if (zone.ageLeft < 0) {
                delete _this._effectZones[Number(key)];
            }
            else {
                zone.tick(dt);
            }
        });
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
    PowerupHandler.prototype.generateZones = function (powerup, amount) {
        var _this = this;
        var currentNumberOfZones = Object.values(this._effectZones).length;
        var rng = seedrandom("".concat(powerup.id));
        //TODO this radius should be changable
        var radius = 200;
        var _loop_1 = function (i) {
            setTimeout(function () {
                var position = new Vector(Math.floor(rng() * (_this.arenaSize - 2 * radius)) + radius, Math.floor(rng() * (_this.arenaSize - 2 * radius)) + radius);
                //TODO this will break in the future [currentNumberOfZones + i]
                _this._effectZones[currentNumberOfZones + i] = new Zone(position, radius, powerup.type);
                // console.log(this._effectZones[currentNumberOfZones + i].position);
            }, 300 * i);
        };
        for (var i = 0; i < amount; i++) {
            _loop_1(i);
        }
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
        if (distance > radius) {
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
                        case PowerupType.Confusion:
                            _this._powerupUpdate.push({
                                action: 2 /* PowerupAction.APPLY */,
                                powerup: powerup,
                                player: player,
                            });
                            _this.generateZones(powerup, 3);
                            break;
                        case PowerupType.Bomb:
                            _this._powerupUpdate.push({
                                action: 2 /* PowerupAction.APPLY */,
                                powerup: powerup,
                                player: player,
                            });
                            _this.generateZones(powerup, 3);
                            break;
                        case PowerupType.Laser:
                            _this._powerupUpdate.push({
                                action: 2 /* PowerupAction.APPLY */,
                                powerup: powerup,
                                player: player,
                            });
                            break;
                        default:
                            snake.applyPowerup(powerup.type);
                            break;
                    }
                    _this.removePowerup(powerup);
                }
            });
            //Check the zones collisions
            var snakeIsInConfusionZone = false;
            Object.values(_this._effectZones).forEach(function (zone) {
                if (_this.isPointInCircle(zone.position, zone.currentRadius, snake.head.endPoint, 5)) {
                    switch (zone.type) {
                        case PowerupType.Bomb:
                            break;
                        case PowerupType.Confusion:
                            snakeIsInConfusionZone = true;
                            break;
                        default:
                            break;
                    }
                }
            });
            // console.log(snakeIsInConfusionZone);
            player.snake.isConfused = snakeIsInConfusionZone;
        });
    };
    return PowerupHandler;
}());
export default PowerupHandler;
//# sourceMappingURL=powerupHandler.js.map