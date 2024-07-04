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
    x: string;
    y: string;
}


  export interface NewLineSegmentMessage {
    startPoint: Point;
    endPoint: Point;
    endAngle: string;
    isCollidable: boolean;
    isNewThisTick: boolean;
}

export interface ExistingLineSegmentMessage {
    endPoint: Point;
}

export interface NewArcSegmentMessage {
  center: Point;
  radius: string;
  startAngle: string;
  endAngle: string;
  counterClockwise: boolean;
  isCollidable: boolean;
  isNewThisTick: boolean;
}

export interface ExistingArcSegmentMessage {
  endAngle: string;
}
