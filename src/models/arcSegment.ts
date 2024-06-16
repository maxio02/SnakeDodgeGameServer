import * as Vec2D from 'vector2d';
import Segment from './segment.js';

export default class ArcSegment extends Segment {
    


    public center: Vec2D.Vector;
    public radius: number;
    public startAngle: number;
    public endAngle: number;
    public counterClockwise: boolean;
    public isCollidable: boolean;
    public isNewThisTick: boolean;

    constructor(center: Vec2D.Vector, radius: number, startAngle: number, endAngle: number, counterClockwise: boolean, isCollidable: boolean) {
        super();
        this.center = center;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.counterClockwise = counterClockwise;
        this.isCollidable = isCollidable;
        this.isNewThisTick = true;
      }

    get endPoint(): Vec2D.Vector {
        return new Vec2D.Vector(
        this.center.x + this.radius * Math.cos(this.endAngle),
        this.center.y + this.radius * Math.sin(this.endAngle)
        );
    }

    get penpendicularEndAngle(): number {
        return this.isCounterClockwise? this.endAngle - Math.PI /2 : this.endAngle + Math.PI / 2;
    }

    get penpendicularStartAngle(): number {
        return this.isCounterClockwise? this.startAngle- Math.PI /2 : this.startAngle + Math.PI / 2;
    }

    isCounterClockwise(): boolean{
        return this.counterClockwise;
    }

    getContinuingSegment(transform: Vec2D.Vector): Segment {
        return new ArcSegment(this.center.clone().add(transform) as Vec2D.Vector, this.radius, this.endAngle, this.endAngle, this.counterClockwise, this.isCollidable);
    }

    toJSON() {
        let endPoint = this.endPoint;
        return {
            center: {x: this.center.x, y: this.center.y},
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            counterClockwise: this.counterClockwise,
            isCollidable: this.isCollidable,
            isNewThisTick: this.isNewThisTick,
            endPoint: {x: endPoint.x, y: endPoint.y}
          };
    }
}