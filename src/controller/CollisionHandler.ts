import { Vector } from "vector2d";
import Snake from "../models/snake.js";
import ArcSegment from "../models/arcSegment.js";
import LineSegment from "../models/lineSegment.js";

export default class CollisionHandler {
    private _snakes: Snake[];


    constructor(snakes: Snake[]) {
        this._snakes = snakes;
    }


    public checkCollisions(): Snake {

        //we will only check the head of snake1 against all other segments on the board (slow)
        this._snakes.forEach(snake1 => {
            //if the snake is dead ignore it
            if (!snake1.isAlive) return;

            //if the head of the snake is not collidable we can skip all further checks
            if (!snake1.head.isCollidable) return;

            //if the angle of the arc segment at the head exeeds 360 deg kill the snake
            if (snake1.head instanceof ArcSegment && Math.abs(snake1.head.endAngle - snake1.head.startAngle) > 2 * Math.PI) {
                snake1.kill();
                // console.log(`snake ${snake1} commited circlicide`);
            }

            this._snakes.forEach(snake2 => {

                snake2.segments.forEach(segment => {

                    //skip the checks if the segment is non collidable or if the segment is itself
                    if (!segment.isCollidable || segment === snake1.head) return;

                    //when turning ignore the line right before, should not be possible to hit it
                    if (snake2 === snake1 && segment === snake1.segments.slice(-2, -1).pop()) return;

                    if (segment instanceof LineSegment) {
                        if (this.isPointOnLine(segment, snake1.head.endPoint, 0.5)) {
                            console.log(segment);
                            snake1.kill();
                            return;
                        }

                    }
                    else if (segment instanceof ArcSegment) {
                        if (this.isPointOnArc(segment, snake1.head.endPoint, 5)) {
                            console.log(segment);
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
        let lineLength = line.length
        let d1 = point.distance(line.startPoint)
        let d2 = point.distance(line.endPoint)

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
             if(normalizedAngle >= normalizedStartAngle && normalizedAngle <= normalizedEndAngle && !arc.isCounterClockwise()) {
                console.log(`${normalizedStartAngle} < ${normalizedAngle} < ${normalizedEndAngle}`);
                return true;
            };
        } else {
            if(normalizedAngle >= normalizedEndAngle && normalizedAngle <= normalizedStartAngle && arc.isCounterClockwise() ) {
                console.log(`${normalizedStartAngle} > ${normalizedAngle} > ${normalizedEndAngle}`)
                return true;
            }            
        }
        return false;
    }
}
