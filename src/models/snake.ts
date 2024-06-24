import { Vector } from "vector2d";
import Segment from "./segment.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";
import Powerup, { PowerupType } from "./powerup.js";

export default class Snake {
  public segments: Segment[] = [];
  public isAlive: boolean = true;
  public turnRadius: number = 90;
  private _distanceToChangeOfState: number = 10;
  private _speed = 1;

  constructor(startPos: LineSegment) {
    this.addSegment(startPos);
  }
  addSegment(segment: Segment) {
    this.segments.push(segment);
  }

  get head(): Segment {
    return this.segments.slice(-1).pop();
  }

  public applyPowerup(powerup: Powerup) {
    //TODO apply constraints to the speed and radius, also add original speed or modification amount
    switch (powerup.type) {
      case PowerupType.SpeedUp:
        this._speed *= 1.2;
        this.turnRadius *= 1.2;
        break;

      case PowerupType.SpeedDown:
        this._speed *= 0.8;
        this.turnRadius *= 0.8;
        break;

      case PowerupType.Invisibility:
        this._distanceToChangeOfState = 1000;

        const lastSegment = this.head;

        if (lastSegment instanceof LineSegment) {
          this.addSegment(
            new LineSegment(
              lastSegment.endPoint,
              new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y),
              false,
              lastSegment.endAngle
            )
          );
        } else if (lastSegment instanceof ArcSegment) {
          this.addSegment(
            new ArcSegment(
              lastSegment.center,
              lastSegment.radius,
              lastSegment.endAngle,
              lastSegment.endAngle,
              lastSegment.isCounterClockwise(),
              false
            )
          );
        }
        break;
    }
  }

  move(distance: number) {
    //do not move is dead, simple
    if (!this.isAlive) return;

    // do not move if snake has no segments
    const lastSegment = this.head;
    if (!lastSegment) return;
    lastSegment.isNewThisTick = false;

    this.checkWalls();

    //move the snake the correct amount, depending on the head segment
    if (lastSegment instanceof LineSegment) {
      const dx = distance * Math.cos(lastSegment.endAngle) * this._speed;
      const dy = distance * Math.sin(lastSegment.endAngle) * this._speed;

      const newEnd = new Vector(
        lastSegment.endPoint.x + dx,
        lastSegment.endPoint.y + dy
      );
      lastSegment.endPoint = newEnd;
    } else if (lastSegment instanceof ArcSegment) {
      const angleExtension = distance * this._speed / lastSegment.radius;

      lastSegment.endAngle = lastSegment.isCounterClockwise()
        ? lastSegment.endAngle - angleExtension
        : lastSegment.endAngle + angleExtension;
    }

    //add new segment lastsegment.createflippedstate
    if (lastSegment.isCollidable && this._distanceToChangeOfState < 0) {
      this._distanceToChangeOfState = Math.random() * 80 + 30; // 40-90

      if (lastSegment instanceof LineSegment) {
        this.addSegment(
          new LineSegment(
            lastSegment.endPoint,
            new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y),
            false,
            lastSegment.endAngle
          )
        );
      } else if (lastSegment instanceof ArcSegment) {
        this.addSegment(
          new ArcSegment(
            lastSegment.center,
            lastSegment.radius,
            lastSegment.endAngle,
            lastSegment.endAngle,
            lastSegment.isCounterClockwise(),
            false
          )
        );
      }
    }

    if (!lastSegment.isCollidable && this._distanceToChangeOfState < 0) {
      this._distanceToChangeOfState = Math.random() * 500 + 80; // 80-320

      if (lastSegment instanceof LineSegment) {
        this.addSegment(
          new LineSegment(
            lastSegment.endPoint,
            new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y),
            true,
            lastSegment.endAngle
          )
        );
      } else if (lastSegment instanceof ArcSegment) {
        this.addSegment(
          new ArcSegment(
            lastSegment.center,
            lastSegment.radius,
            lastSegment.endAngle,
            lastSegment.endAngle,
            lastSegment.isCounterClockwise(),
            true
          )
        );
      }
    }

    //update the distance travelled
    this._distanceToChangeOfState -= distance;
  }

  kill() {
    console.log("SNAKE DEAD");
    this.isAlive = false;
  }

  // TODO change the 2000 to something else
  checkWalls() {
    const lastSegment = this.head;
    if (lastSegment.endPoint.x < 0) {
      this.kill();
      // this.addSegment(lastSegment.getContinuingSegment(new Vector(2000, 0)));
    } else if (lastSegment.endPoint.x > 2000) {
      this.kill();
      // this.addSegment(lastSegment.getContinuingSegment(new Vector(-2000, 0)));
    }

    if (lastSegment.endPoint.y < 0) {
      this.kill();
      // this.addSegment(lastSegment.getContinuingSegment(new Vector(0, 2000)));
    } else if (lastSegment.endPoint.y > 2000) {
      this.kill();
      // this.addSegment(lastSegment.getContinuingSegment(new Vector(0, -2000)));
    }
  }
}
