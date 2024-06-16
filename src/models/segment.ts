import { Vector } from "vector2d";

export default abstract class Segment {
    abstract isCollidable: boolean;
    abstract get endAngle(): number;
    abstract get endPoint(): Vector;
    abstract isNewThisTick: boolean;
    abstract getContinuingSegment(transform: Vector): Segment;
}