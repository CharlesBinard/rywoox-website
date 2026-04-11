import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { GameHub } from '@/components/GameHub';
import { GameView } from '@/components/GameView';
import { ProfilePage } from '@/pages/ProfilePage';

// Define the routes
const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GameHub,
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game/$gameId',
  component: GameView,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([indexRoute, gameRoute, profileRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Type declarations for route params
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export type GameId =
  | 'snake'
  | 'pong'
  | 'memory'
  | 'tetris'
  | 'flappy'
  | 'tictactoe'
  | 'connectfour'
  | 'numbermerge'
  | 'minesweeper'
  | 'breakout';

export interface Game {
  id: GameId;
  name: string;
  description: string;
  emoji: string;
  color: string;
  hue: string;
}
