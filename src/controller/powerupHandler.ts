import { Vector } from "vector2d";
import Powerup from "../models/powerup.js";
import Snake from "../models/snake.js";

export enum PowerupType {
  SpeedUp,
  SpeedDown,
  Bomb,
  FlipButtons,
  Invisibility,
  PortalWalls,
}

export const enum PowerupAction {
    REMOVE,
    ADD
  }

export default class PowerupHandler {
  private _snakes: Snake[];
  private _timeToNextPowerupSpawn: number = 10;
  private _avgTimeBetweenPowerUps: number;
  private _powerups: { [key: number]: Powerup } = {};
  private _powerupCounter: number;
  private _powerupUpdate: {action: PowerupAction, powerup: Powerup}
  constructor(snakes: Snake[], avgTimeBetweenPowerups: number) {
    this._snakes = snakes;
    this._avgTimeBetweenPowerUps = avgTimeBetweenPowerups;
    this._powerupCounter = 0;
  }

  public tick(dt: number) {
    if (this._timeToNextPowerupSpawn < 0) {

        this._timeToNextPowerupSpawn = Math.random() * this._avgTimeBetweenPowerUps * 2; //TODO add min amount probs  

      this.addPowerup(
        // new Powerup(
        //   this._powerupCounter,
        //   new Vector(Math.random() * 1600 + 200, Math.random() * 1600 + 200),
        //   "#000000".replace(/0/g, function () {
        //     return (~~(Math.random() * 10)).toString(16);
        //   }),
        //   this.getRandomPowerupType()
        // )
        new Powerup(
            this._powerupCounter,
            new Vector(Math.random() * 1600 + 200, Math.random() * 1600 + 200),
            "#000000".replace(/0/g, function () {
              return (~~(Math.random() * 13)).toString(16);
            }),
            this.getRandomPowerupType()
          )
      );
      this._powerupCounter++;
    }

    this._timeToNextPowerupSpawn -= dt;
  }

  private addPowerup(powerup: Powerup) {
    this._powerupUpdate = {action: PowerupAction.ADD, powerup};
    this._powerups[powerup.id] = powerup;
  }

  public removePowerup(powerup: Powerup) {
    this._powerupUpdate = {action: PowerupAction.REMOVE, powerup};
    delete this._powerups[powerup.id];
    
  }

  public resetUpdate(){
    this._powerupUpdate = null;
  }
  
  public get powerupUpdate() {
    return this._powerupUpdate;
  }

  getRandomPowerupType(): PowerupType {
    const powerupTypes = Object.values(PowerupType).filter(
      (value) => typeof value === "number"
    ) as PowerupType[];
    const randomIndex = Math.floor(Math.random() * powerupTypes.length);
    return powerupTypes[randomIndex];
  }

  private isPointInCircle(
    center: Vector,
    radius: number,
    point: Vector,
    epsilon: number
  ) {
    let distance = point.distance(center);

    if (Math.abs(distance - radius) > epsilon) {
      return false;
    } else {
      return true;
    }
  }

  checkCollisions() {
    this._snakes.forEach((snake) => {
      //if the snake is dead ignore it
      if (!snake.isAlive) return;

      Object.values(this._powerups).forEach(powerup => {
        if (this.isPointInCircle(powerup.position, powerup.radius, snake.head.endPoint, 5)){
            snake.applyPowerup(powerup);
            this.removePowerup(powerup);//TODO fix removing in loop XD
            
        }
      });
    });
  }
}
