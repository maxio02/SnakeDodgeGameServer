import { Vector } from "vector2d";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
import { PowerupType } from "./powerup.js";
var Snake = /** @class */ (function () {
    function Snake(startPos) {
        this.segments = [];
        this.isAlive = true;
        this._turnRadius = 90;
        this._timeToChangeOfState = Math.random() * 2500 + 350;
        this._speed = 0.3;
        this.addSegment(startPos);
    }
    Snake.prototype.addSegment = function (segment) {
        this.segments.push(segment);
    };
    Object.defineProperty(Snake.prototype, "head", {
        get: function () {
            return this.segments.slice(-1).pop();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Snake.prototype, "turnRadius", {
        get: function () {
            return this._turnRadius;
        },
        enumerable: false,
        configurable: true
    });
    Snake.prototype.applyPowerup = function (powerup) {
        //TODO apply constraints to the speed and radius, also add original speed or modification amount
        switch (powerup.type) {
            case PowerupType.SpeedUp:
                this._speed *= 1.2;
                this._turnRadius *= 1.1;
                break;
            case PowerupType.SpeedDown:
                this._speed *= 0.8;
                this._turnRadius *= 0.9;
                break;
            case PowerupType.Invisibility:
                this._timeToChangeOfState = 6000;
                var lastSegment = this.head;
                if (lastSegment instanceof LineSegment) {
                    this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), false, lastSegment.endAngle));
                }
                else if (lastSegment instanceof ArcSegment) {
                    this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), false));
                }
                break;
        }
    };
    Snake.prototype.move = function (dt) {
        //do not move is dead, simple
        if (!this.isAlive)
            return;
        // do not move if snake has no segments
        var lastSegment = this.head;
        if (!lastSegment)
            return;
        //move the snake the correct amount, depending on the head segment
        if (lastSegment instanceof LineSegment) {
            // if (lastSegment.startPoint.x !== lastSegment.endPoint.x || lastSegment.startPoint.y !== lastSegment.endPoint.y){
            //   lastSegment.isNewThisTick = false;
            // }
            var dx = dt * Math.cos(lastSegment.endAngle) * this._speed;
            var dy = dt * Math.sin(lastSegment.endAngle) * this._speed;
            var newEnd = new Vector(lastSegment.endPoint.x + dx, lastSegment.endPoint.y + dy);
            lastSegment.endPoint = newEnd;
        }
        else if (lastSegment instanceof ArcSegment) {
            // if (lastSegment.startAngle !== lastSegment.endAngle){
            //   lastSegment.isNewThisTick = false;
            // }
            var angleExtension = dt * this._speed / lastSegment.radius;
            lastSegment.endAngle = lastSegment.isCounterClockwise()
                ? lastSegment.endAngle - angleExtension
                : lastSegment.endAngle + angleExtension;
        }
        //add new segment lastsegment.createflippedstate
        if (lastSegment.isCollidable && this._timeToChangeOfState < 0) {
            this._timeToChangeOfState = Math.random() * 280 + 150; // 40-90
            if (lastSegment instanceof LineSegment) {
                this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), false, lastSegment.endAngle));
            }
            else if (lastSegment instanceof ArcSegment) {
                this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), false));
            }
        }
        if (!lastSegment.isCollidable && this._timeToChangeOfState < 0) {
            this._timeToChangeOfState = Math.random() * 2500 + 350; // 80-320
            if (lastSegment instanceof LineSegment) {
                this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), true, lastSegment.endAngle));
            }
            else if (lastSegment instanceof ArcSegment) {
                this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), true));
            }
        }
        this._timeToChangeOfState -= dt;
    };
    Snake.prototype.kill = function () {
        this.isAlive = false;
    };
    return Snake;
}());
export default Snake;
//# sourceMappingURL=snake.js.map