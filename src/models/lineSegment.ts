import { Vector } from "vector2d";
import Segment from "./segment.js";
import { ExistingLineSegmentMessage, NewLineSegmentMessage } from "../messageTypes.js";

export default class LineSegment extends Segment {
  public startPoint: Vector;
  public endPoint: Vector;
  public endAngle: number;
  public isCollidable: boolean = true;
  public isNewThisTick: boolean;

  constructor(
    start: Vector,
    end: Vector,
    isCollidable: boolean,
    angle?: number
  ) {
    super();
    this.startPoint = start;
    this.endPoint = end;
    this.isCollidable = isCollidable;
    this.endAngle = angle;
    this.isNewThisTick = true;
  }

  private calcEndAngle(): number {
    return Math.atan(
      (this.endPoint.y - this.startPoint.y) /
        (this.endPoint.x - this.startPoint.x)
    );
  }

  get length(): number {
    return Math.sqrt(
      (this.startPoint.x - this.endPoint.x) ** 2 +
        (this.startPoint.y - this.endPoint.y) ** 2
    );
  }

  getContinuingSegment(transform: Vector): Segment {
    const transformedEndpoint = this.endPoint.clone().add(transform) as Vector;
    return new LineSegment(
      transformedEndpoint,
      transformedEndpoint,
      this.isCollidable,
      this.endAngle
    );
  }

  toMessageFormat(): NewLineSegmentMessage | ExistingLineSegmentMessage {
    if (this.isNewThisTick) {
        return {
            startPoint: { x: this.startPoint.x.toFixed(2), y: this.startPoint.y.toFixed(2) },
            endPoint: { x: this.endPoint.x.toFixed(2), y: this.endPoint.y.toFixed(2) },
            endAngle: this.endAngle.toFixed(3),
            isCollidable: this.isCollidable,
            isNewThisTick: this.isNewThisTick,
        };
    } else {
        return {
            endPoint: { x: this.endPoint.x.toFixed(2), y: this.endPoint.y.toFixed(2) },
        };
    }
}
}
