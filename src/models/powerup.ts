import { Vector } from "vector2d";

export enum PowerupType {
  SpeedUp,
  SpeedDown,
  Bomb,
  FlipButtons,
  Invisibility,
  PortalWalls,
}

export default class Powerup {
  private _id: number;
  private _position: Vector;
  private _color: string;
  private _radius: number = 30;
  private _type: PowerupType;

  constructor(id: number, position: Vector, color: string, type: PowerupType) {
    this._id = id;
    this._position = position;
    this._color = color;
    this._type = type;
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

  toJSON() {
    return {
      id: this._id,
      position: {x: this.position.x, y: this.position.y},
      color: this._color,
      type: this._type,
      radius: this._radius
    };
  }
}
