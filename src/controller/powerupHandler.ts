import { Vector } from "vector2d";
import Powerup, { PowerupType } from "../models/powerup.js";
import CollisionHandler from "./CollisionHandler.js";
import { Player } from "../models/player.js";

export const enum PowerupAction {
  REMOVE,
  SPAWN,
  APPLY,
}

export default class PowerupHandler {
  private _players: Player[];
  private _timeToNextPowerupSpawn: number = 10;
  private _avgTimeBetweenPowerUps: number;
  private _powerups: { [key: number]: Powerup } = {};
  private _effectZones: {};
  private _powerupCounter: number;
  private _powerupUpdate: {
    action: PowerupAction;
    powerup: Powerup;
    player: Player;
  }[] = [];
  private _collisionHandler: CollisionHandler;
  private _maxPowerupAmount: number;

  constructor(
    players: Player[],
    avgTimeBetweenPowerups: number,
    maxPowerupAmount: number,
    collisionHandler: CollisionHandler
  ) {
    this._players = players;
    this._avgTimeBetweenPowerUps = avgTimeBetweenPowerups;
    this._powerupCounter = 0;
    this._collisionHandler = collisionHandler;
    this._maxPowerupAmount = maxPowerupAmount;
    this._powerupUpdate = [];
  }

  public tick(dt: number) {
    if (
      this._timeToNextPowerupSpawn < 0 &&
      Object.keys(this._powerups).length < this._maxPowerupAmount
    ) {
      this._timeToNextPowerupSpawn =
        Math.random() * this._avgTimeBetweenPowerUps * 2; //TODO add min amount probs
      let powerupType = this.getRandomPowerupType();
      let powerupDuration = 0;
      switch (powerupType) {
        case PowerupType.PortalWalls:
          powerupDuration = 10000;
          break;
        case PowerupType.CameraLockToPlayer:
          powerupDuration = 15000;
          break;
        default:
          powerupDuration = 0;
          break;
      }
      this.addPowerup(
        new Powerup(
          this._powerupCounter,
          new Vector(Math.random() * 1800 + 100, Math.random() * 1800 + 100),
          "#000000".replace(/0/g, function () {
            return (~~(Math.random() * 14)).toString(16);
          }),
          powerupType,
          powerupDuration
        )
      );
      this._powerupCounter++;
    }
    if (Object.keys(this._powerups).length < this._maxPowerupAmount) {
      this._timeToNextPowerupSpawn -= dt;
    }
  }

  private addPowerup(powerup: Powerup) {
    this._powerupUpdate.push({
      action: PowerupAction.SPAWN,
      powerup,
      player: null,
    });
    this._powerups[powerup.id] = powerup;
  }

  public removePowerup(powerup: Powerup) {
    this._powerupUpdate.push({
      action: PowerupAction.REMOVE,
      powerup,
      player: null,
    });
    delete this._powerups[powerup.id];
  }

  public resetUpdate() {
    this._powerupUpdate = [];
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

  public checkCollisions() {
    this._players.forEach((player) => {
      let snake = player.snake;
      //if the snake is dead ignore it
      if (!snake.isAlive) return;

      //Check the powerup collisions
      Object.values(this._powerups).forEach((powerup) => {
        if (
          this.isPointInCircle(
            powerup.position,
            powerup.radius,
            snake.head.endPoint,
            5
          )
        ) {
          switch (powerup.type) {
            case PowerupType.PortalWalls:
              //only set the timeout if we are flipping the state, if another wrapWalls Is active then do not set another timeout //TODO this is wrong
              if (this._collisionHandler.wrapWalls === false) {
                setTimeout(() => {
                  this._collisionHandler.wrapWalls = false;
                }, powerup.duration);
              }

              this._collisionHandler.wrapWalls = true;

              this._powerupUpdate.push({
                action: PowerupAction.APPLY,
                powerup,
                player: player,
              });
              break;
            case PowerupType.FlipButtons:
              break;
            case PowerupType.CameraLockToPlayer:
              this._powerupUpdate.push({
                action: PowerupAction.APPLY,
                powerup,
                player: player,
              });
              break;
            default:
              snake.applyPowerup(powerup);
              break;
          }
          this.removePowerup(powerup);
        }
      });
    });
  }
}
