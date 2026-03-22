import type { GlassCardProps } from './GlassCard.types';

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const GlassCard = ({
  children,
  glowBorder = false,
  padding = 'md',
  className = '',
  ...props
}: GlassCardProps) => {
  return (
    <div
      className={`
        glass rounded-2xl
        ${glowBorder ? 'glow-border' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
