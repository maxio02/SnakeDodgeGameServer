import { PowerupType } from "./powerup.js";
var Zone = /** @class */ (function () {
    function Zone(position, radius, type) {
        this.position = position;
        this._maxRadius = radius;
        this.currentRadius = 0;
        this.type = type;
        this._animationProgress = 0;
        var spawnAnimationDuration = 0;
        switch (type) {
            case PowerupType.Bomb:
                spawnAnimationDuration = 3;
                this.ageLeft = 3000;
                break;
            case PowerupType.Confusion:
                spawnAnimationDuration = 0.5;
                this.ageLeft = 10000;
                break;
            default:
                console.log("this should never happen!");
                break;
        }
        this._growSpeed = 1 / 50 / spawnAnimationDuration;
    }
    Zone.prototype.tick = function (dt) {
        this.ageLeft -= dt;
        if (this._animationProgress < 1) {
            this._animationProgress = Math.min(this._animationProgress + this._growSpeed, 1);
            this.currentRadius = this._maxRadius * easeOutCubic(this._animationProgress);
        }
    };
    Zone.prototype.toJSON = function () {
        return {
            position: this.position,
            radius: this.currentRadius,
            type: this.type
        };
    };
    return Zone;
}());
export default Zone;
function easeOutQuint(x) {
    console.log(x, 1 - Math.pow(1 - x, 5));
    return 1 - Math.pow(1 - x, 5);
}
function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}
//# sourceMappingURL=zone.js.map