export function checkWhoseTurn(state: any[]): 'x' | '0'  {
  const checkNull = (s: any) => s === null;

  if (state.filter(checkNull).length === state.length) {
    return 'x';
  }

  const checkX = (s: any) => s === 'x';
  const check0 = (s: any) => s === '0';

  const lenghtX = state.filter(checkX).length;
  const lenght0 = state.filter(check0).length;

  return lenghtX > lenght0
    ? '0'
    : 'x';
}
