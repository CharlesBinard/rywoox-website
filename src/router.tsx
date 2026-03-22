import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { GameHub } from '@/components/GameHub';
import { GameView } from '@/components/GameView';

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

const routeTree = rootRoute.addChildren([indexRoute, gameRoute]);

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
