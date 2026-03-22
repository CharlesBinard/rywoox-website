import type { HTMLAttributes, ReactNode } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glowBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
