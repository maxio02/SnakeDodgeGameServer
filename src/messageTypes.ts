import { PowerupAction } from './controller/powerupHandler';
import Powerup from './models/powerup';

  export interface MessagePowerup{
    action: PowerupAction,
    powerup: Powerup,
  }
