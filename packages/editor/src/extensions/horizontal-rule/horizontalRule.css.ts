import { style } from '@vanilla-extract/css';

export const hr = style({
  padding: '2px 2px',
  border: 'none',
  margin: '1em 0',
  cursor: 'pointer',
  borderRadius: 'calc(var(--radius) - 4px)',
  ':after': {
    content: '',
    display: 'block',
    height: 2,
    backgroundColor: 'hsl(var(--muted))',
    lineHeight: 2,
  },
  selectors: {
    '&.selected': {
      outline: '2px solid hsl(var(--ring))',
      userSelect: 'none',
    },
  },
});
