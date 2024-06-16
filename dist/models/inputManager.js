import { Vector } from "vector2d";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
var InputManager = /** @class */ (function () {
    function InputManager(snake) {
        this.snake = snake;
    }
    InputManager.prototype.handleInput = function (key, pressed) {
        if (pressed) {
            this.onKeyDown(key);
        }
        else {
            this.onKeyUp(key);
        }
    };
    InputManager.prototype.onKeyDown = function (turnDirection) {
        //if snake is dead, ignore the key presses
        if (!this.snake.isAlive)
            return;
        var head = this.snake.head;
        var endPoint = head.endPoint;
        var tangentAngle = 0;
        if (head instanceof LineSegment) {
            tangentAngle += Math.PI / 2;
            head.isNewThisTick = false;
            if (turnDirection == 1 /* Dir.RIGHT */) {
                this.snake.addSegment(new ArcSegment(new Vector(endPoint.x + this.snake.turnRadius * Math.cos(this.snake.head.endAngle + tangentAngle), endPoint.y + this.snake.turnRadius * Math.sin(this.snake.head.endAngle + tangentAngle)), this.snake.turnRadius, this.snake.head.endAngle - tangentAngle, this.snake.head.endAngle - tangentAngle, false, head.isCollidable));
            }
            if (turnDirection == 0 /* Dir.LEFT */) {
                this.snake.addSegment(new ArcSegment(new Vector(endPoint.x + this.snake.turnRadius * Math.cos(this.snake.head.endAngle - tangentAngle), endPoint.y + this.snake.turnRadius * Math.sin(this.snake.head.endAngle - tangentAngle)), this.snake.turnRadius, this.snake.head.endAngle + tangentAngle, this.snake.head.endAngle + tangentAngle, true, head.isCollidable));
            }
        }
        else if (head instanceof ArcSegment) {
            tangentAngle = head.isCounterClockwise ? -Math.PI : Math.PI;
            if (turnDirection == 1 /* Dir.RIGHT */) {
                this.snake.addSegment(new ArcSegment(new Vector(endPoint.x - this.snake.turnRadius * Math.cos(this.snake.head.endAngle + tangentAngle), endPoint.y - this.snake.turnRadius * Math.sin(this.snake.head.endAngle + tangentAngle)), this.snake.turnRadius, this.snake.head.endAngle - tangentAngle, this.snake.head.endAngle - tangentAngle, false, head.isCollidable));
            }
            if (turnDirection == 0 /* Dir.LEFT */) {
                this.snake.addSegment(new ArcSegment(new Vector(endPoint.x - this.snake.turnRadius * Math.cos(this.snake.head.endAngle - tangentAngle), endPoint.y - this.snake.turnRadius * Math.sin(this.snake.head.endAngle - tangentAngle)), this.snake.turnRadius, this.snake.head.endAngle + tangentAngle, this.snake.head.endAngle + tangentAngle, true, head.isCollidable));
            }
        }
    };
    InputManager.prototype.onKeyUp = function (turnDirection) {
        //if snake is dead, ignore the key presses
        if (!this.snake.isAlive)
            return;
        var head = this.snake.head;
        var endPoint = head.endPoint;
        var angle = head.endAngle;
        if (turnDirection == 0 /* Dir.LEFT */ && head instanceof ArcSegment && head.isCounterClockwise()) {
            angle -= Math.PI / 2;
        }
        else if (turnDirection == 1 /* Dir.RIGHT */ && head instanceof ArcSegment && !head.isCounterClockwise()) {
            angle += Math.PI / 2;
        }
        this.snake.addSegment(new LineSegment(endPoint, new Vector(endPoint.x + 5 * Math.cos(angle), endPoint.y + 5 * Math.sin(angle)), head.isCollidable, angle));
        //console.log(this.snake.head);
    };
    return InputManager;
}());
export default InputManager;
//# sourceMappingURL=inputManager.js.map