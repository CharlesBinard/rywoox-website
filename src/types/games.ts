export type GameId =
  | 'snake'
  | 'pong'
  | 'memory'
  | 'tetris'
  | 'flappy'
  | 'tictactoe'
  | 'connectfour';

export interface Game {
  id: GameId;
  name: string;
  description: string;
  emoji: string;
  color: string;
  hue: string;
}
