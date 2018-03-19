import { PlayerType } from '../../shared/interfaces/IGame';

export function checkWhoseTurn(state: any[]): PlayerType  {
  const checkNull = (s: any) => s === null;

  if (state.filter(checkNull).length === state.length) {
    return PlayerType.X;
  }

  const checkX = (s: any) => s === PlayerType.X;
  const check0 = (s: any) => s === PlayerType.O;

  const lenghtX = state.filter(checkX).length;
  const lenght0 = state.filter(check0).length;

  return lenghtX > lenght0
    ? PlayerType.O
    : PlayerType.X;
}
