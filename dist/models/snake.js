import { Vector } from "vector2d";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
var Snake = /** @class */ (function () {
    function Snake(startPos, color) {
        this.segments = [];
        this.isAlive = true;
        this.turnRadius = 90;
        this.distanceToChangeOfState = 10;
        this.addSegment(startPos);
        this.color = color;
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
    Snake.prototype.move = function (distance) {
        //do not move is dead, simple
        if (!this.isAlive)
            return;
        // do not move if snake has no segments
        var lastSegment = this.head;
        if (!lastSegment)
            return;
        lastSegment.isNewThisTick = false;
        this.checkWalls();
        //move the snake the correct amount, depending on the head segment
        if (lastSegment instanceof LineSegment) {
            var dx = distance * Math.cos(lastSegment.endAngle);
            var dy = distance * Math.sin(lastSegment.endAngle);
            var newEnd = new Vector(lastSegment.endPoint.x + dx, lastSegment.endPoint.y + dy);
            lastSegment.endPoint = newEnd;
        }
        else if (lastSegment instanceof ArcSegment) {
            var angleExtension = distance / lastSegment.radius;
            lastSegment.endAngle = lastSegment.isCounterClockwise() ? lastSegment.endAngle - angleExtension : lastSegment.endAngle + angleExtension;
        }
        //add new segment lastsegment.createflippedstate
        if (lastSegment.isCollidable && this.distanceToChangeOfState < 0) {
            this.distanceToChangeOfState = Math.random() * 80 + 30; // 40-90
            if (lastSegment instanceof LineSegment) {
                this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), false, lastSegment.endAngle));
            }
            else if (lastSegment instanceof ArcSegment) {
                this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), false));
            }
        }
        if (!lastSegment.isCollidable && this.distanceToChangeOfState < 0) {
            this.distanceToChangeOfState = Math.random() * 500 + 80; // 80-320
            if (lastSegment instanceof LineSegment) {
                this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), true, lastSegment.endAngle));
            }
            else if (lastSegment instanceof ArcSegment) {
                this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), true));
            }
        }
        //update the distance travelled
        this.distanceToChangeOfState -= distance;
    };
    Snake.prototype.kill = function () {
        console.log("SNAKE DEAD");
        this.isAlive = false;
        // this.emitter = new Emitter(this.head.endPoint, 1, 7, 4, 'circle', { ...hexToRgb(this.color), a: 1 }, this.canvasCtx, true, true, 70, 4);
    };
    // TODO change the 2000 to something else
    Snake.prototype.checkWalls = function () {
        var lastSegment = this.head;
        if (lastSegment.endPoint.x < 0) {
            this.addSegment(lastSegment.getContinuingSegment(new Vector(2000, 0)));
        }
        else if (lastSegment.endPoint.x > 2000) {
            this.addSegment(lastSegment.getContinuingSegment(new Vector(-2000, 0)));
        }
        if (lastSegment.endPoint.y < 0) {
            this.addSegment(lastSegment.getContinuingSegment(new Vector(0, 2000)));
        }
        else if (lastSegment.endPoint.y > 2000) {
            this.addSegment(lastSegment.getContinuingSegment(new Vector(0, -2000)));
        }
    };
    return Snake;
}());
export default Snake;
//# sourceMappingURL=snake.js.map