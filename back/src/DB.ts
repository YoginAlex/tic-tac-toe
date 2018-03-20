/* tslint:disable prefer-array-literal */
import * as Lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import * as Uuid from 'uuid';

import { IDbSchema } from '../../shared/interfaces/IDbSchema';
import { GamePhase, IGame } from '../../shared/interfaces/IGame';
import { checkEmptyGame } from './helpers';

const GAME_START_DIFF = 10 * 60 * 1000; // 10 minutes

const defaultState: IDbSchema = {
  games: [],
};

export default class DB {
  private db: Lowdb.Lowdb<IDbSchema, Lowdb.AdapterSync<IDbSchema>>;

  constructor() {
    const adapter: Lowdb.AdapterSync<IDbSchema> = new FileSync('db.json', {
      defaultValue: defaultState,
    });

    this.db = Lowdb<IDbSchema, typeof adapter>(adapter);
  }

  public getState() {
    return this.db.getState();
  }

  public getGame(id: string): IGame | null {
    return this.getGames()
      .find(({ id: gameId }) => gameId === id)
      .value();
  }

  public getFreeGame(): IGame {
    this.cleanOldGames();

    const freeGame = this.getGames()
      .find(({ phase }) => phase === GamePhase.NEW || phase === GamePhase.FOUND_X)
      .value();

    return freeGame ? freeGame : this.createNewGame();
  }

  public reload() {
    this.db.read();
  }

  public updateGame(id: string, obj: IGame): IGame {
    return this.getGames()
      .find(({ id: gameId }) => gameId === id)
      .assign(obj)
      .write();
  }

  private createNewGame(): IGame {
    const newId: string = Uuid.v4();

    const newGame = this.getGames()
      .push({
        id: newId,
        phase: GamePhase.NEW,
        start: new Date(),
        state: new Array(9).fill(null),
      })
      .write()
      .find(({ id }) => id === newId);

    return newGame;
  }

  private cleanOldGames() {
    this.getGames()
      .remove(({ start }) => new Date().getTime() - start.getTime() <= GAME_START_DIFF)
      .write();
  }

  private getDb(): Lowdb.Lowdb<IDbSchema, Lowdb.AdapterSync<IDbSchema>> {
    return this.db;
  }

  private getGames() {
    return this.getDb().get('games');
  }

  private getAllGames(): IGame[] {
    return this.getGames().value();
  }
}
