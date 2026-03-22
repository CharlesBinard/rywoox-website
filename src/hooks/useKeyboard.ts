import { useCallback, useEffect } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type KeyMap = Record<string, Direction>;

const DEFAULT_KEY_MAP: KeyMap = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
  W: 'UP',
  S: 'DOWN',
  A: 'LEFT',
  D: 'RIGHT',
};

export interface UseKeyboardOptions {
  onMove: (direction: Direction) => void;
  enabled?: boolean;
  keyMap?: KeyMap;
}

/**
 * Hook for keyboard controls (arrow keys, WASD).
 */
export const useKeyboard = (options: UseKeyboardOptions): void => {
  const { onMove, enabled = true, keyMap = DEFAULT_KEY_MAP } = options;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        onMove(dir);
      }
    },
    [enabled, keyMap, onMove]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enabled, handleKey]);
};
