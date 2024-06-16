import ArcSegment from "../models/arcSegment.js";
import LineSegment from "../models/lineSegment.js";
var CollisionHandler = /** @class */ (function () {
    function CollisionHandler(snakes) {
        this.snakes = snakes;
    }
    CollisionHandler.prototype.checkCollisions = function () {
        var _this = this;
        //we will only check the head of snake1 against all other segments on the board (slow)
        this.snakes.forEach(function (snake1) {
            //if the snake is dead ignore it
            if (!snake1.isAlive)
                return;
            //if the head of the snake is not collidable we can skip all further checks
            if (!snake1.head.isCollidable)
                return;
            //if the angle of the arc segment at the head exeeds 360 deg kill the snake
            if (snake1.head instanceof ArcSegment && Math.abs(snake1.head.endAngle - snake1.head.startAngle) > 2 * Math.PI) {
                snake1.kill();
                // console.log(`snake ${snake1} commited circlicide`);
            }
            _this.snakes.forEach(function (snake2) {
                snake2.segments.forEach(function (segment) {
                    //skip the checks if the segment is non collidable or if the segment is itself
                    if (!segment.isCollidable || segment === snake1.head)
                        return;
                    //when turning ignore the line right before, should not be possible to hit it
                    if (snake2 === snake1 && segment === snake1.segments.slice(-2, -1).pop())
                        return;
                    if (segment instanceof LineSegment) {
                        if (_this.isPointOnLine(segment, snake1.head.endPoint, 0.5)) {
                            console.log(segment);
                            snake1.kill();
                            return;
                        }
                    }
                    else if (segment instanceof ArcSegment) {
                        if (_this.isPointOnArc(segment, snake1.head.endPoint, 5)) {
                            console.log(segment);
                            snake1.kill();
                            return;
                        }
                    }
                });
            });
        });
        return null;
    };
    CollisionHandler.prototype.isPointOnLine = function (line, point, epsilon) {
        var lineLength = line.length;
        var d1 = point.distance(line.startPoint);
        var d2 = point.distance(line.endPoint);
        if (Math.abs(d1 + d2 - lineLength) > epsilon) {
            return false;
        }
        return true;
    };
    CollisionHandler.prototype.isPointOnArc = function (arc, point, epsilon) {
        //if (Math.atan((arc.center.y - point.y) / (arc.center.x - point.x)))
        var distance = point.distance(arc.center);
        if (Math.abs(distance - arc.radius) > epsilon) {
            return false;
        }
        // Calculate the angle of the point relative to the arc's center
        var angle = Math.atan2(point.y - arc.center.y, point.x - arc.center.x);
        var startAngle = arc.startAngle;
        var endAngle = arc.endAngle;
        // Normalize angles to be between 0 and 2*PI
        var normalizeAngle = function (angle) {
            var normalized = angle % (2 * Math.PI);
            if (normalized < 0) {
                normalized += 2 * Math.PI;
            }
            return normalized;
        };
        var normalizedAngle = normalizeAngle(angle);
        var normalizedStartAngle = normalizeAngle(startAngle);
        var normalizedEndAngle = normalizeAngle(endAngle);
        // Check if the angle lies within the start and end angles
        //The isCounterClockwise check is for when the start to end has rolled over 2pi
        //TODO THIS IS WRONG
        if (normalizedStartAngle <= normalizedEndAngle) {
            if (normalizedAngle >= normalizedStartAngle && normalizedAngle <= normalizedEndAngle && !arc.isCounterClockwise()) {
                console.log("".concat(normalizedStartAngle, " < ").concat(normalizedAngle, " < ").concat(normalizedEndAngle));
                return true;
            }
            ;
        }
        else {
            if (normalizedAngle >= normalizedEndAngle && normalizedAngle <= normalizedStartAngle && arc.isCounterClockwise()) {
                console.log("".concat(normalizedStartAngle, " > ").concat(normalizedAngle, " > ").concat(normalizedEndAngle));
                return true;
            }
        }
        return false;
    };
    return CollisionHandler;
}());
export default CollisionHandler;
//# sourceMappingURL=CollisionHandler.js.map