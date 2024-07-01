import { Vector } from "vector2d";
import Snake from "./snake.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";

export const enum Dir{
    LEFT,
    RIGHT
}
export default class InputManager {
  private _snake: Snake;
  private _flipKeys: boolean = false;

  constructor(snake: Snake) {
    this._snake = snake;
  }

  public handleInput(key: Dir, pressed: boolean){
    if (pressed) {
      if (this._flipKeys) {
        key = key === Dir.LEFT ? Dir.RIGHT : Dir.LEFT;
      }
      this.onKeyDown(key);
    } else {
      if (this._flipKeys) {
        key = key === Dir.LEFT ? Dir.RIGHT : Dir.LEFT;
      }
      this.onKeyUp(key);
    }
  }

  private onKeyDown(turnDirection: Dir): void {
    //if snake is dead, ignore the key presses
    if(!this._snake.isAlive) return;


    let head = this._snake.head;
    let endPoint = head.endPoint;
    let tangentAngle = 0;


    if (head instanceof LineSegment) {
      tangentAngle += Math.PI / 2;
      head.isNewThisTick = false;
      if (turnDirection == Dir.RIGHT) {

        this._snake.addSegment(new ArcSegment(new Vector(
          endPoint.x + this._snake.turnRadius * Math.cos(this._snake.head.endAngle + tangentAngle),
          endPoint.y + this._snake.turnRadius * Math.sin(this._snake.head.endAngle + tangentAngle)),
          this._snake.turnRadius, this._snake.head.endAngle - tangentAngle, this._snake.head.endAngle - tangentAngle, false, head.isCollidable))
      }
      if (turnDirection == Dir.LEFT) {
        this._snake.addSegment(new ArcSegment(new Vector(
          endPoint.x + this._snake.turnRadius * Math.cos(this._snake.head.endAngle - tangentAngle),
          endPoint.y + this._snake.turnRadius * Math.sin(this._snake.head.endAngle - tangentAngle)),
          this._snake.turnRadius, this._snake.head.endAngle + tangentAngle, this._snake.head.endAngle + tangentAngle, true, head.isCollidable))
      }

    } 

    else if (head instanceof ArcSegment) {

      tangentAngle = head.isCounterClockwise ? -Math.PI : Math.PI;
      if (turnDirection == Dir.RIGHT) {
        this._snake.addSegment(new ArcSegment(new Vector(
          endPoint.x - this._snake.turnRadius * Math.cos(this._snake.head.endAngle + tangentAngle),
          endPoint.y - this._snake.turnRadius * Math.sin(this._snake.head.endAngle + tangentAngle)),
          this._snake.turnRadius, this._snake.head.endAngle + tangentAngle, this._snake.head.endAngle + tangentAngle, false, head.isCollidable))
      }
      if (turnDirection == Dir.LEFT) {
        this._snake.addSegment(new ArcSegment(new Vector(
          endPoint.x - this._snake.turnRadius * Math.cos(this._snake.head.endAngle - tangentAngle),
          endPoint.y - this._snake.turnRadius * Math.sin(this._snake.head.endAngle - tangentAngle)),
          this._snake.turnRadius, this._snake.head.endAngle - tangentAngle, this._snake.head.endAngle - tangentAngle, true, head.isCollidable))
      }

    }

  }
  private onKeyUp(turnDirection: Dir): void {
    //if snake is dead, ignore the key presses
    if(!this._snake.isAlive) return;
    



    let head = this._snake.head;
    let endPoint = head.endPoint;
    let angle = head.endAngle;

    if (turnDirection == Dir.LEFT && head instanceof ArcSegment && head.isCounterClockwise()) {

      angle -= Math.PI / 2;
    } else if (turnDirection == Dir.RIGHT && head instanceof ArcSegment && !head.isCounterClockwise()) {

      angle += Math.PI / 2;
    }



    this._snake.addSegment(new LineSegment(endPoint,
      new Vector(endPoint.x +  Math.cos(angle), endPoint.y +  Math.sin(angle)), head.isCollidable ,angle));

    //console.log(this.snake.head);
  }

  public invertKeys(){
    this._flipKeys = !this._flipKeys;
  }
}

