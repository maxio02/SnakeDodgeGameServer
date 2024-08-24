import { Vector } from 'vector2d';
import { PowerupType } from "./powerup.js";
export default class Zone {
    public position: Vector;
    public currentRadius: number;
    private _maxRadius: number;
    public type: PowerupType;
    private _growSpeed: number;
    public ageLeft: number;

    private _animationProgress: number;
    constructor(
        position: Vector,
        radius: number,
        type: PowerupType
        ){

        
        this.position = position;
        this._maxRadius = radius;
        this.currentRadius = 0;
        this.type = type;
        this._animationProgress = 0;
        
        let spawnAnimationDuration = 0;
        switch (type) {
            case PowerupType.Bomb:
                spawnAnimationDuration = 3;
                this.ageLeft = 3000;
                break;
            case PowerupType.Confusion:
                spawnAnimationDuration = 0.5;
                this.ageLeft = 10000;
                break;
            default:
                console.log("this should never happen!")
                break;
        }
        this._growSpeed = 1/50/spawnAnimationDuration;
    }

    public tick(dt: number) {
        this.ageLeft -= dt;
        if (this._animationProgress < 1){
            this._animationProgress = Math.min(this._animationProgress + this._growSpeed, 1);
            this.currentRadius = this._maxRadius * easeOutCubic(this._animationProgress);
        }
    }

    toJSON() {
        return {
            position: this.position,
            radius: this.currentRadius,
            type: this.type
        };
    }
    
}

function easeOutQuint(x: number): number {
    console.log(x, 1 - Math.pow(1 - x, 5));
    return 1 - Math.pow(1 - x, 5);
}

function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}