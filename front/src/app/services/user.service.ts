import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { IGame, GamePhase, PlayerType } from '../../../../shared/interfaces/IGame';

const DAFAULT_NAME_KEY = 'ttt-player-name';

const DEFAULT_PLAYER_0 = 'player0';
const DEFAULT_PLAYER_X = 'playerX';

@Injectable()
export class UserService {
  private _game: string;
  private _type: PlayerType;
  name: string | null;

  constructor(private storage: LocalStorageService) {
    this.name = localStorage.getItem(DAFAULT_NAME_KEY);
  }

  setName(name: string): void {
    this.name = name;
    this.storage.setItem(DAFAULT_NAME_KEY, name);
  }

  set game(key: string) {
    this._game = key;
  }
  get game() {
    return this._game;
  }

  set type(key: PlayerType) {
    this._type = key;
  }
  get type() {
    return this._type;
  }

  setUserTypeByGame(game: IGame): PlayerType {
    this.type = game.phase === GamePhase.NEW
      ? PlayerType.X
      : PlayerType.O;

    return this.type;
  }

  setNameToDefault(game: IGame): void {
    const type = this.setUserTypeByGame(game);

    if (type === PlayerType.X) {
      this.setName(DEFAULT_PLAYER_X);
    } else {
      this.setName(DEFAULT_PLAYER_0);
    }
  }
}
