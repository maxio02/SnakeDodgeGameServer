import { Vector } from "vector2d";
import { ExistingArcSegmentMessage, ExistingLineSegmentMessage, NewArcSegmentMessage, NewLineSegmentMessage } from "../messageTypes";

export default abstract class Segment {
    abstract isCollidable: boolean;
    abstract get endAngle(): number;
    abstract get endPoint(): Vector;
    abstract isNewThisTick: boolean;
    abstract getContinuingSegment(transform: Vector): Segment;
    abstract toMessageFormat(): NewLineSegmentMessage | ExistingLineSegmentMessage | NewArcSegmentMessage | ExistingArcSegmentMessage;
}