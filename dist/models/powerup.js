export var PowerupType;
(function (PowerupType) {
    PowerupType[PowerupType["SpeedUp"] = 0] = "SpeedUp";
    PowerupType[PowerupType["SpeedDown"] = 1] = "SpeedDown";
    PowerupType[PowerupType["Bomb"] = 2] = "Bomb";
    PowerupType[PowerupType["FlipButtons"] = 3] = "FlipButtons";
    PowerupType[PowerupType["Invisibility"] = 4] = "Invisibility";
    PowerupType[PowerupType["PortalWalls"] = 5] = "PortalWalls";
})(PowerupType || (PowerupType = {}));
var Powerup = /** @class */ (function () {
    function Powerup(id, position, color, type) {
        this._radius = 30;
        this._id = id;
        this._position = position;
        this._color = color;
        this._type = type;
    }
    Object.defineProperty(Powerup.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Powerup.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Powerup.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Powerup.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    Powerup.prototype.toJSON = function () {
        return {
            id: this._id,
            position: { x: this.position.x, y: this.position.y },
            color: this._color,
            type: this._type,
            radius: this._radius
        };
    };
    return Powerup;
}());
export default Powerup;
//# sourceMappingURL=powerup.js.map