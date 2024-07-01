import { Vector } from "vector2d";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
var InputManager = /** @class */ (function () {
    function InputManager(snake) {
        this._flipKeys = false;
        this._snake = snake;
    }
    InputManager.prototype.handleInput = function (key, pressed) {
        if (pressed) {
            if (this._flipKeys) {
                key = key === 0 /* Dir.LEFT */ ? 1 /* Dir.RIGHT */ : 0 /* Dir.LEFT */;
            }
            this.onKeyDown(key);
        }
        else {
            if (this._flipKeys) {
                key = key === 0 /* Dir.LEFT */ ? 1 /* Dir.RIGHT */ : 0 /* Dir.LEFT */;
            }
            this.onKeyUp(key);
        }
    };
    InputManager.prototype.onKeyDown = function (turnDirection) {
        //if snake is dead, ignore the key presses
        if (!this._snake.isAlive)
            return;
        var head = this._snake.head;
        var endPoint = head.endPoint;
        var tangentAngle = 0;
        if (head instanceof LineSegment) {
            tangentAngle += Math.PI / 2;
            head.isNewThisTick = false;
            if (turnDirection == 1 /* Dir.RIGHT */) {
                this._snake.addSegment(new ArcSegment(new Vector(endPoint.x + this._snake.turnRadius * Math.cos(this._snake.head.endAngle + tangentAngle), endPoint.y + this._snake.turnRadius * Math.sin(this._snake.head.endAngle + tangentAngle)), this._snake.turnRadius, this._snake.head.endAngle - tangentAngle, this._snake.head.endAngle - tangentAngle, false, head.isCollidable));
            }
            if (turnDirection == 0 /* Dir.LEFT */) {
                this._snake.addSegment(new ArcSegment(new Vector(endPoint.x + this._snake.turnRadius * Math.cos(this._snake.head.endAngle - tangentAngle), endPoint.y + this._snake.turnRadius * Math.sin(this._snake.head.endAngle - tangentAngle)), this._snake.turnRadius, this._snake.head.endAngle + tangentAngle, this._snake.head.endAngle + tangentAngle, true, head.isCollidable));
            }
        }
        else if (head instanceof ArcSegment) {
            tangentAngle = head.isCounterClockwise ? -Math.PI : Math.PI;
            if (turnDirection == 1 /* Dir.RIGHT */) {
                this._snake.addSegment(new ArcSegment(new Vector(endPoint.x - this._snake.turnRadius * Math.cos(this._snake.head.endAngle + tangentAngle), endPoint.y - this._snake.turnRadius * Math.sin(this._snake.head.endAngle + tangentAngle)), this._snake.turnRadius, this._snake.head.endAngle + tangentAngle, this._snake.head.endAngle + tangentAngle, false, head.isCollidable));
            }
            if (turnDirection == 0 /* Dir.LEFT */) {
                this._snake.addSegment(new ArcSegment(new Vector(endPoint.x - this._snake.turnRadius * Math.cos(this._snake.head.endAngle - tangentAngle), endPoint.y - this._snake.turnRadius * Math.sin(this._snake.head.endAngle - tangentAngle)), this._snake.turnRadius, this._snake.head.endAngle - tangentAngle, this._snake.head.endAngle - tangentAngle, true, head.isCollidable));
            }
        }
    };
    InputManager.prototype.onKeyUp = function (turnDirection) {
        //if snake is dead, ignore the key presses
        if (!this._snake.isAlive)
            return;
        var head = this._snake.head;
        var endPoint = head.endPoint;
        var angle = head.endAngle;
        if (turnDirection == 0 /* Dir.LEFT */ && head instanceof ArcSegment && head.isCounterClockwise()) {
            angle -= Math.PI / 2;
        }
        else if (turnDirection == 1 /* Dir.RIGHT */ && head instanceof ArcSegment && !head.isCounterClockwise()) {
            angle += Math.PI / 2;
        }
        this._snake.addSegment(new LineSegment(endPoint, new Vector(endPoint.x + Math.cos(angle), endPoint.y + Math.sin(angle)), head.isCollidable, angle));
        //console.log(this.snake.head);
    };
    InputManager.prototype.invertKeys = function () {
        this._flipKeys = !this._flipKeys;
    };
    return InputManager;
}());
export default InputManager;
//# sourceMappingURL=inputManager.js.map