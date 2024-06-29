import { PowerupAction } from './controller/powerupHandler';
import { Player } from './models/player';
import Powerup from './models/powerup';

  export interface MessagePowerup{
    action: PowerupAction,
    powerup: Powerup,
    player: Player
  }
