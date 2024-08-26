import { Vector } from "vector2d";

export enum PowerupType {
  SpeedUp,
  SpeedDown,
  Bomb,
  Laser,
  Invisibility,
  PortalWalls,
  CameraLockToPlayer,
  Confusion
}

export default class Powerup {
  private _id: number;
  private _position: Vector;
  private _color: string;
  private _radius: number = 30;
  private _type: PowerupType;
  private _duration: number;

  constructor(id: number, position: Vector, color: string, type: PowerupType, duration: number) {
    this._id = id;
    this._position = position;
    this._color = color;
    this._type = type;
    this._duration = duration;
  }

  public get id(): number {
    return this._id;
  }

  public get position(): Vector {
    return this._position;
  }

  public get radius(): number {
    return this._radius;
  }

  public get type(): PowerupType {
    return this._type;
  }

  public get duration(): PowerupType {
    return this._duration;
  }


  toJSON() {
    return {
      id: this._id,
      position: {x: this.position.x, y: this.position.y},
      color: this._color,
      type: this._type,
      radius: this._radius,
      duration: this._duration
    };
  }
}
