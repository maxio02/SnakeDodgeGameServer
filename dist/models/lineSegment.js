var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Segment from "./segment.js";
var LineSegment = /** @class */ (function (_super) {
    __extends(LineSegment, _super);
    function LineSegment(start, end, isCollidable, angle) {
        var _this = _super.call(this) || this;
        _this.isCollidable = true;
        _this.startPoint = start;
        _this.endPoint = end;
        _this.isCollidable = isCollidable;
        _this.endAngle = angle;
        _this.isNewThisTick = true;
        return _this;
    }
    LineSegment.prototype.calcEndAngle = function () {
        return Math.atan((this.endPoint.y - this.startPoint.y) /
            (this.endPoint.x - this.startPoint.x));
    };
    Object.defineProperty(LineSegment.prototype, "length", {
        get: function () {
            return Math.sqrt(Math.pow((this.startPoint.x - this.endPoint.x), 2) +
                Math.pow((this.startPoint.y - this.endPoint.y), 2));
        },
        enumerable: false,
        configurable: true
    });
    LineSegment.prototype.getContinuingSegment = function (transform) {
        var transformedEndpoint = this.endPoint.clone().add(transform);
        return new LineSegment(transformedEndpoint, transformedEndpoint, this.isCollidable, this.endAngle);
    };
    LineSegment.prototype.splitSegmentAtCircle = function (circleCenter, radius) {
        var d = this.endPoint.clone().subtract(this.startPoint);
        var f = this.startPoint.clone().subtract(circleCenter);
        var a = d.dot(d);
        var b = 2 * f.dot(d);
        var c = f.dot(f) - radius * radius;
        // Discriminant
        var discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            // No intersection
            return [this];
        }
        else {
            // Calculate the two points of intersection (if they exist)
            var discriminantSqrt = Math.sqrt(discriminant);
            var t1 = (-b - discriminantSqrt) / (2 * a);
            var t2 = (-b + discriminantSqrt) / (2 * a);
            var intersections = [];
            if (t1 >= 0 && t1 <= 1) {
                intersections.push(this.startPoint.clone().add(d.clone().multiplyByScalar(t1)));
            }
            if (t2 >= 0 && t2 <= 1) {
                intersections.push(this.startPoint.clone().add(d.clone().multiplyByScalar(t2)));
            }
            if (intersections.length === 0) {
                // No intersections within the segment bounds
                return [this];
            }
            else if (intersections.length === 1) {
                // One intersection: split into two segments
                var intersectPoint = intersections[0];
                var segment1 = new LineSegment(this.startPoint, intersectPoint, this.isCollidable, this.endAngle);
                var segment2 = new LineSegment(intersectPoint, this.endPoint, false, this.endAngle);
                return [segment1, segment2];
            }
            else {
                // Two intersections: split into three segments
                var _a = intersections, intersect1 = _a[0], intersect2 = _a[1];
                var segment1 = new LineSegment(this.startPoint, intersect1, this.isCollidable, this.endAngle);
                var segment2 = new LineSegment(intersect1, intersect2, false, this.endAngle);
                var segment3 = new LineSegment(intersect2, this.endPoint, this.isCollidable, this.endAngle);
                return [segment1, segment2, segment3];
            }
        }
    };
    LineSegment.prototype.toMessageFormat = function () {
        if (this.isNewThisTick) {
            return {
                startPoint: {
                    x: this.startPoint.x.toFixed(2),
                    y: this.startPoint.y.toFixed(2),
                },
                endPoint: {
                    x: this.endPoint.x.toFixed(2),
                    y: this.endPoint.y.toFixed(2),
                },
                endAngle: this.endAngle.toFixed(3),
                isCollidable: this.isCollidable,
                isNewThisTick: this.isNewThisTick,
            };
        }
        else {
            return {
                endPoint: {
                    x: this.endPoint.x.toFixed(2),
                    y: this.endPoint.y.toFixed(2),
                },
            };
        }
    };
    return LineSegment;
}(Segment));
export default LineSegment;
//# sourceMappingURL=lineSegment.js.map