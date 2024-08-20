import { style } from '@vanilla-extract/css';

export const menu = style({
  borderRadius: '4px',
  padding: '2px 1px',
  cursor: 'grab',
  opacity: 0,
  position: 'absolute',
  left: 0,
  top: 0,
  willChange: 'transform',
  color: 'hsl(var(--muted-foreground))',
  ':active': {
    cursor: 'grabbing',
  },
  ':hover': {
    backgroundColor: 'hsl(var(--muted))',
  },
});

export const targetLine = style({
  pointerEvents: 'none',
  backgroundColor: 'hsl(var(--ring))',
  height: 4,
  position: 'absolute',
  left: 0,
  top: 0,
  opacity: 0,
  willChange: 'transform',
});
