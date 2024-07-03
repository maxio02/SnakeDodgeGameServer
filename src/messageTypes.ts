import { Vector } from 'vector2d';
import { PowerupAction } from './controller/powerupHandler';
import { Player } from './models/player';
import Powerup from './models/powerup';

  export interface MessagePowerup{
    action: PowerupAction,
    powerup: Powerup,
    player: Player
  }

  interface Point {
    x: number;
    y: number;
}


  export interface NewLineSegmentMessage {
    startPoint: Point;
    endPoint: Point;
    endAngle: number;
    isCollidable: boolean;
    isNewThisTick: boolean;
}

export interface ExistingLineSegmentMessage {
    endPoint: Point;
}

export interface NewArcSegmentMessage {
  center: Point
  radius: number;
  startAngle: number
  endAngle: number;
  counterClockwise: boolean;
  isCollidable: boolean;
  isNewThisTick: boolean;
}

export interface ExistingArcSegmentMessage {
  endAngle: number;
}
