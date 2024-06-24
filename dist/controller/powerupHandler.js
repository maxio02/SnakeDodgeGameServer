import { Vector } from "vector2d";
import Powerup from "../models/powerup.js";
export var PowerupType;
(function (PowerupType) {
    PowerupType[PowerupType["SpeedUp"] = 0] = "SpeedUp";
    PowerupType[PowerupType["SpeedDown"] = 1] = "SpeedDown";
    PowerupType[PowerupType["Bomb"] = 2] = "Bomb";
    PowerupType[PowerupType["FlipButtons"] = 3] = "FlipButtons";
    PowerupType[PowerupType["Invisibility"] = 4] = "Invisibility";
    PowerupType[PowerupType["PortalWalls"] = 5] = "PortalWalls";
})(PowerupType || (PowerupType = {}));
var PowerupHandler = /** @class */ (function () {
    function PowerupHandler(snakes, avgTimeBetweenPowerups) {
        this._timeToNextPowerupSpawn = 10;
        this._powerups = {};
        this._snakes = snakes;
        this._avgTimeBetweenPowerUps = avgTimeBetweenPowerups;
        this._powerupCounter = 0;
    }
    PowerupHandler.prototype.tick = function (dt) {
        if (this._timeToNextPowerupSpawn < 0) {
            this._timeToNextPowerupSpawn = Math.random() * this._avgTimeBetweenPowerUps * 2; //TODO add min amount probs  
            this.addPowerup(
            // new Powerup(
            //   this._powerupCounter,
            //   new Vector(Math.random() * 1600 + 200, Math.random() * 1600 + 200),
            //   "#000000".replace(/0/g, function () {
            //     return (~~(Math.random() * 10)).toString(16);
            //   }),
            //   this.getRandomPowerupType()
            // )
            new Powerup(this._powerupCounter, new Vector(Math.random() * 1600 + 200, Math.random() * 1600 + 200), "#000000".replace(/0/g, function () {
                return (~~(Math.random() * 13)).toString(16);
            }), this.getRandomPowerupType()));
            this._powerupCounter++;
        }
        this._timeToNextPowerupSpawn -= dt;
    };
    PowerupHandler.prototype.addPowerup = function (powerup) {
        this._powerupUpdate = { action: 1 /* PowerupAction.ADD */, powerup: powerup };
        this._powerups[powerup.id] = powerup;
    };
    PowerupHandler.prototype.removePowerup = function (powerup) {
        this._powerupUpdate = { action: 0 /* PowerupAction.REMOVE */, powerup: powerup };
        delete this._powerups[powerup.id];
    };
    PowerupHandler.prototype.resetUpdate = function () {
        this._powerupUpdate = null;
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
        this._snakes.forEach(function (snake) {
            //if the snake is dead ignore it
            if (!snake.isAlive)
                return;
            Object.values(_this._powerups).forEach(function (powerup) {
                if (_this.isPointInCircle(powerup.position, powerup.radius, snake.head.endPoint, 5)) {
                    snake.applyPowerup(powerup);
                    _this.removePowerup(powerup); //TODO fix removing in loop XD
                }
            });
        });
    };
    return PowerupHandler;
}());
export default PowerupHandler;
//# sourceMappingURL=powerupHandler.js.map