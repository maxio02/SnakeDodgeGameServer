import { Vector } from "vector2d";
import Segment from "./segment.js";
import LineSegment from "./lineSegment.js";
import ArcSegment from "./arcSegment.js";

export default class Snake {
    public segments: Segment[] = [];
    private color: string;
    public isAlive: boolean = true;
    public turnRadius: number = 90;
    private distanceToChangeOfState: number = 10;



    constructor(startPos: LineSegment, color: string) {
        this.addSegment(startPos);
        this.color = color;
    }
    addSegment(segment: Segment) {
        this.segments.push(segment);
    }

    get head(): Segment {
        return this.segments.slice(-1).pop();
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
            const dx = distance * Math.cos(lastSegment.endAngle);
            const dy = distance * Math.sin(lastSegment.endAngle);

            const newEnd = new Vector(lastSegment.endPoint.x + dx, lastSegment.endPoint.y + dy);
            lastSegment.endPoint = newEnd;

        }
        else if (lastSegment instanceof ArcSegment) {
            const angleExtension = distance / lastSegment.radius;

            lastSegment.endAngle = lastSegment.isCounterClockwise() ? lastSegment.endAngle - angleExtension : lastSegment.endAngle + angleExtension;

        }
        
        //add new segment lastsegment.createflippedstate
        if (lastSegment.isCollidable && this.distanceToChangeOfState < 0) {

            this.distanceToChangeOfState = Math.random() * 80 + 30 // 40-90
            
            if (lastSegment instanceof LineSegment) {
                this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), false, lastSegment.endAngle));
            }
            else if (lastSegment instanceof ArcSegment) {
                this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), false))
            }
        }

        if (!lastSegment.isCollidable && this.distanceToChangeOfState < 0) {

            this.distanceToChangeOfState = Math.random() * 500 + 80 // 80-320

            if (lastSegment instanceof LineSegment) {
                this.addSegment(new LineSegment(lastSegment.endPoint, new Vector(lastSegment.endPoint.x, lastSegment.endPoint.y), true, lastSegment.endAngle))
            }
            else if (lastSegment instanceof ArcSegment) {
                this.addSegment(new ArcSegment(lastSegment.center, lastSegment.radius, lastSegment.endAngle, lastSegment.endAngle, lastSegment.isCounterClockwise(), true))
            }

        }

        //update the distance travelled
        this.distanceToChangeOfState -= distance;
    }

kill() {
    console.log("SNAKE DEAD")
    this.isAlive = false;
    // this.emitter = new Emitter(this.head.endPoint, 1, 7, 4, 'circle', { ...hexToRgb(this.color), a: 1 }, this.canvasCtx, true, true, 70, 4);
}

// TODO change the 2000 to something else
checkWalls() {
    const lastSegment = this.head;
    if (lastSegment.endPoint.x < 0) {
        this.kill();
        // this.addSegment(lastSegment.getContinuingSegment(new Vector(2000, 0)));
    } 
    else if (lastSegment.endPoint.x > 2000) {
        this.kill();
        // this.addSegment(lastSegment.getContinuingSegment(new Vector(-2000, 0)));
    }
    
    if (lastSegment.endPoint.y < 0) {
        this.kill();
        // this.addSegment(lastSegment.getContinuingSegment(new Vector(0, 2000)));
    } 
    else if (lastSegment.endPoint.y > 2000) {
        this.kill();
        // this.addSegment(lastSegment.getContinuingSegment(new Vector(0, -2000)));
    }
    
}

    
}