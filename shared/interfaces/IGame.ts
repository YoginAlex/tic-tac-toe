export enum GamePhase {
  NEW,
  FOUND_X,
  FOUND_0,
  STARTED,
  FINISHED,
}

export interface IJoinGame {
  gameId: string;
  playerName: string;
}

export interface ITurn {
  type: 'x' | '0';
  position: 0|1|2|3|4|5|6|7|8;
}

export interface IGame {
  id: string;
  playerX?: string;
  player0?: string;
  start?: Date;
  state: any[];
  phase: GamePhase;
}
