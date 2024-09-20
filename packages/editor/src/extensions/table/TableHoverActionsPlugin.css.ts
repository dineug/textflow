import { keyframes, style } from '@vanilla-extract/css';

const tableControls = keyframes({
  '0%': {
    opacity: 0,
  },
  '100%': {
    opacity: 1,
  },
});

export const tableAddRows = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  width: 'calc(100% - 25px)',
  backgroundColor: 'hsl(var(--muted-foreground))',
  animation: `${tableControls} 0.2s ease`,
  border: 0,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: 'hsl(var(--ring))',
  },
});

export const tableAddColumns = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  backgroundColor: 'hsl(var(--muted-foreground))',
  height: '100%',
  animation: `${tableControls} 0.2s ease`,
  border: 0,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: 'hsl(var(--ring))',
  },
});

export const icon = style({
  color: 'hsl(var(--muted))',
});
