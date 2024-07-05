import { Vector } from "vector2d";
import Snake from "../models/snake.js";
import ArcSegment from "../models/arcSegment.js";
import LineSegment from "../models/lineSegment.js";

export default class CollisionHandler {
  private _snakes: Snake[];
  public wrapWalls: boolean = false;
  public arenaSize: number;
  public selfCollision: boolean
  constructor(snakes: Snake[], arenaSize: number, selfCollision: boolean) {
    this._snakes = snakes;
    this.arenaSize = arenaSize;
    this.selfCollision = selfCollision;

  }

  public checkCollisions(): Snake {

    this.checkWalls();
    //we will only check the head of snake1 against all other segments on the board (slow)
    this._snakes.forEach((snake1) => {
      //if the snake is dead ignore it
      if (!snake1.isAlive) return;

      //if the head of the snake is not collidable we can skip all further checks
      if (!snake1.head.isCollidable) return;

      //if the angle of the arc segment at the head exeeds 360 deg kill the snake
      if (
        snake1.head instanceof ArcSegment &&
        Math.abs(snake1.head.endAngle - snake1.head.startAngle) > 2 * Math.PI
      ) {
        snake1.kill();
      }

      this._snakes.forEach((snake2) => {
        snake2.segments.forEach((segment) => {
          //if self collision is turned off we want to skip the check
          if(this.selfCollision === false && snake1 === snake2){
            return;
          }

          //skip the checks if the segment is non collidable or if the segment is itself
          if (!segment.isCollidable || segment === snake1.head) return;

          //when turning ignore the line right before, should not be possible to hit it
          if (
            snake2 === snake1 &&
            segment === snake1.segments.slice(-2, -1).pop()
          )
            return;

          if (segment instanceof LineSegment) {
            if (this.isPointOnLine(segment, snake1.head.endPoint, 0.5)) {
              snake1.kill();
              return;
            }
          } else if (segment instanceof ArcSegment) {
            if (this.isPointOnArc(segment, snake1.head.endPoint, 5)) {
              snake1.kill();
              return;
            }
          }
        });
      });
    });

    return null;
  }

  private isPointOnLine(line: LineSegment, point: Vector, epsilon: number) {
    let lineLength = line.length;
    let d1 = point.distance(line.startPoint);
    let d2 = point.distance(line.endPoint);

    if (Math.abs(d1 + d2 - lineLength) > epsilon) {
      return false;
    }
    return true;
  }

  private isPointOnArc(arc: ArcSegment, point: Vector, epsilon: number) {
    //if (Math.atan((arc.center.y - point.y) / (arc.center.x - point.x)))
    let distance = point.distance(arc.center);

    if (Math.abs(distance - arc.radius) > epsilon) {
      return false;
    }

    // Calculate the angle of the point relative to the arc's center
    const angle = Math.atan2(point.y - arc.center.y, point.x - arc.center.x);
    const startAngle = arc.startAngle;
    const endAngle = arc.endAngle;

    // Normalize angles to be between 0 and 2*PI
    const normalizeAngle = (angle: number): number => {
      let normalized = angle % (2 * Math.PI);
      if (normalized < 0) {
        normalized += 2 * Math.PI;
      }
      return normalized;
    };

    const normalizedAngle = normalizeAngle(angle);
    const normalizedStartAngle = normalizeAngle(startAngle);
    const normalizedEndAngle = normalizeAngle(endAngle);

    // Check if the angle lies within the start and end angles
    //The isCounterClockwise check is for when the start to end has rolled over 2pi
    //TODO THIS IS WRONG
    if (normalizedStartAngle <= normalizedEndAngle) {
      if (
        normalizedAngle >= normalizedStartAngle &&
        normalizedAngle <= normalizedEndAngle &&
        !arc.isCounterClockwise()
      ) {
        return true;
      }
    } else {
      if (
        normalizedAngle >= normalizedEndAngle &&
        normalizedAngle <= normalizedStartAngle &&
        arc.isCounterClockwise()
      ) {
        return true;
      }
    }
    return false;
  }

  public checkWalls() {
    Object.values(this._snakes).forEach((snake) => {
      if (!snake.isAlive) return;
      const lastSegment = snake.head;

      //check all four boundries
      if (lastSegment.endPoint.x < 0 || lastSegment.endPoint.x > this.arenaSize ||
        lastSegment.endPoint.y < 0 || lastSegment.endPoint.y > this.arenaSize) {
            if (this.wrapWalls) {
                // the new segment has to wrap either on x or y, if it does not on one of them then that coord is 0
                const newX = (lastSegment.endPoint.x < 0) ? this.arenaSize : (lastSegment.endPoint.x > this.arenaSize) ? -this.arenaSize : 0;
                const newY = (lastSegment.endPoint.y < 0) ? this.arenaSize : (lastSegment.endPoint.y > this.arenaSize) ? -this.arenaSize : 0;
                snake.addSegment(lastSegment.getContinuingSegment(new Vector(newX, newY)));
              } else {
                snake.kill();
              }
            }
    });
  }
}
