/* tslint:disable prefer-array-literal */
import * as Lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import * as Uuid from 'uuid';

import { IDbSchema } from '../../shared/interfaces/IDbSchema';
import { GamePhase, IGame } from '../../shared/interfaces/IGame';

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

  public getGame(id: string): IGame | null {
    return this.getGames()
      .find(({ id: gameId }) => gameId === id)
      .value();
  }

  public getFreeGame(): IGame {
    const freeGame = this.getGames()
      .find(({ phase }) => phase === GamePhase.NEW || phase === GamePhase.FOUND_X)
      .value();

    return freeGame ? freeGame : this.createNewGame();
  }

  public updateGame(id: string, obj: IGame): IGame {
    console.log('--- updateGame', obj);
    return this.getGames()
      .find(({ id: gameId }) => gameId === id)
      .assign(obj)
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

  private createNewGame(): IGame {
    const newId: string = Uuid.v4().replace(/-/gi, '');

    const newGame = this.getGames()
      .push({
        id: newId,
        phase: GamePhase.NEW,
        state: new Array(9).fill(null),
      })
      .write()
      .find(({ id }) => id === newId);

    return newGame;
  }
}