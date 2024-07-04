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
import * as Vec2D from "vector2d";
import Segment from "./segment.js";
var ArcSegment = /** @class */ (function (_super) {
    __extends(ArcSegment, _super);
    function ArcSegment(center, radius, startAngle, endAngle, counterClockwise, isCollidable) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.radius = radius;
        _this.startAngle = startAngle;
        _this.endAngle = endAngle;
        _this.counterClockwise = counterClockwise;
        _this.isCollidable = isCollidable;
        _this.isNewThisTick = true;
        return _this;
    }
    Object.defineProperty(ArcSegment.prototype, "endPoint", {
        get: function () {
            return new Vec2D.Vector(this.center.x + this.radius * Math.cos(this.endAngle), this.center.y + this.radius * Math.sin(this.endAngle));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ArcSegment.prototype, "penpendicularEndAngle", {
        get: function () {
            return this.isCounterClockwise
                ? this.endAngle - Math.PI / 2
                : this.endAngle + Math.PI / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ArcSegment.prototype, "penpendicularStartAngle", {
        get: function () {
            return this.isCounterClockwise
                ? this.startAngle - Math.PI / 2
                : this.startAngle + Math.PI / 2;
        },
        enumerable: false,
        configurable: true
    });
    ArcSegment.prototype.isCounterClockwise = function () {
        return this.counterClockwise;
    };
    ArcSegment.prototype.getContinuingSegment = function (transform) {
        return new ArcSegment(this.center.clone().add(transform), this.radius, this.endAngle, this.endAngle, this.counterClockwise, this.isCollidable);
    };
    ArcSegment.prototype.toJSON = function () {
        var endPoint = this.endPoint;
        return {
            center: { x: this.center.x, y: this.center.y },
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            counterClockwise: this.counterClockwise,
            isCollidable: this.isCollidable,
            isNewThisTick: this.isNewThisTick,
            endPoint: { x: endPoint.x, y: endPoint.y },
        };
    };
    ArcSegment.prototype.toMessageFormat = function () {
        if (this.isNewThisTick) {
            return {
                center: { x: this.center.x.toFixed(2), y: this.center.y.toFixed(2) },
                radius: this.radius.toFixed(2),
                startAngle: this.startAngle.toFixed(3),
                endAngle: this.endAngle.toFixed(3),
                counterClockwise: this.counterClockwise,
                isCollidable: this.isCollidable,
                isNewThisTick: this.isNewThisTick,
            };
        }
        else {
            return {
                endAngle: this.endAngle.toFixed(3),
            };
        }
    };
    return ArcSegment;
}(Segment));
export default ArcSegment;
//# sourceMappingURL=arcSegment.js.map