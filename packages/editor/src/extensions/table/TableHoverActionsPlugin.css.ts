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
  height: 20,
  animation: `${tableControls} 0.2s ease`,
  border: 0,
  cursor: 'pointer',
  backgroundColor: 'hsl(var(--secondary))',
  color: 'hsl(var(--muted-foreground))',
  ':hover': {
    backgroundColor: 'hsl(var(--muted))',
  },
});

export const tableAddColumns = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  animation: `${tableControls} 0.2s ease`,
  border: 0,
  cursor: 'pointer',
  backgroundColor: 'hsl(var(--secondary))',
  color: 'hsl(var(--muted-foreground))',
  ':hover': {
    backgroundColor: 'hsl(var(--muted))',
  },
});
