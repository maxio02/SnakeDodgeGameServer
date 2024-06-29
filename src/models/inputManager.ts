import { Vector } from "vector2d";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";

export const enum Dir{
    LEFT,
    RIGHT
}
export default class InputManager {
  private snake: Snake;

  constructor(snake: Snake) {
    this.snake = snake;
  }

  public handleInput(key: Dir, pressed: boolean){
        if(pressed) {
            this.onKeyDown(key);
        }
        else{
            this.onKeyUp(key);
        }
  }

  private onKeyDown(turnDirection: Dir): void {
    //if snake is dead, ignore the key presses
    if(!this.snake.isAlive) return;


    let head = this.snake.head;
    let endPoint = head.endPoint;
    let tangentAngle = 0;


    if (head instanceof LineSegment) {
      tangentAngle += Math.PI / 2;
      head.isNewThisTick = false;
      if (turnDirection == Dir.RIGHT) {

        this.snake.addSegment(new ArcSegment(new Vector(
          endPoint.x + this.snake.turnRadius * Math.cos(this.snake.head.endAngle + tangentAngle),
          endPoint.y + this.snake.turnRadius * Math.sin(this.snake.head.endAngle + tangentAngle)),
          this.snake.turnRadius, this.snake.head.endAngle - tangentAngle, this.snake.head.endAngle - tangentAngle, false, head.isCollidable))
      }
      if (turnDirection == Dir.LEFT) {
        this.snake.addSegment(new ArcSegment(new Vector(
          endPoint.x + this.snake.turnRadius * Math.cos(this.snake.head.endAngle - tangentAngle),
          endPoint.y + this.snake.turnRadius * Math.sin(this.snake.head.endAngle - tangentAngle)),
          this.snake.turnRadius, this.snake.head.endAngle + tangentAngle, this.snake.head.endAngle + tangentAngle, true, head.isCollidable))
      }

    } 

    else if (head instanceof ArcSegment) {

      tangentAngle = head.isCounterClockwise ? -Math.PI : Math.PI;
      if (turnDirection == Dir.RIGHT) {
        this.snake.addSegment(new ArcSegment(new Vector(
          endPoint.x - this.snake.turnRadius * Math.cos(this.snake.head.endAngle + tangentAngle),
          endPoint.y - this.snake.turnRadius * Math.sin(this.snake.head.endAngle + tangentAngle)),
          this.snake.turnRadius, this.snake.head.endAngle + tangentAngle, this.snake.head.endAngle + tangentAngle, false, head.isCollidable))
      }
      if (turnDirection == Dir.LEFT) {
        this.snake.addSegment(new ArcSegment(new Vector(
          endPoint.x - this.snake.turnRadius * Math.cos(this.snake.head.endAngle - tangentAngle),
          endPoint.y - this.snake.turnRadius * Math.sin(this.snake.head.endAngle - tangentAngle)),
          this.snake.turnRadius, this.snake.head.endAngle - tangentAngle, this.snake.head.endAngle - tangentAngle, true, head.isCollidable))
      }

    }

  }
  private onKeyUp(turnDirection: Dir): void {
    //if snake is dead, ignore the key presses
    if(!this.snake.isAlive) return;
    



    let head = this.snake.head;
    let endPoint = head.endPoint;
    let angle = head.endAngle;

    if (turnDirection == Dir.LEFT && head instanceof ArcSegment && head.isCounterClockwise()) {

      angle -= Math.PI / 2;
    } else if (turnDirection == Dir.RIGHT && head instanceof ArcSegment && !head.isCounterClockwise()) {

      angle += Math.PI / 2;
    }



    this.snake.addSegment(new LineSegment(endPoint,
      new Vector(endPoint.x +  Math.cos(angle), endPoint.y +  Math.sin(angle)), head.isCollidable ,angle));

    //console.log(this.snake.head);
  }
}

