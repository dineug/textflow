import { style } from '@vanilla-extract/css';

export const collapsibleContainer = style({
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  marginBottom: 8,
});

export const collapsibleTitle = style({
  cursor: 'pointer',
  padding: '5px 5px 5px 20px',
  position: 'relative',
  fontWeight: 'bold',
  listStyle: 'none',
  outline: 'none',
  '::marker': {
    display: 'none',
  },
  ':before': {
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: '4px 6px 4px 6px',
    borderLeftColor: 'hsl(var(--foreground))',
    display: 'block',
    content: '',
    position: 'absolute',
    left: 7,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  selectors: {
    [`${collapsibleContainer}[open] > &:before`]: {
      borderColor: 'transparent',
      borderWidth: '6px 4px 0 4px',
      borderTopColor: 'hsl(var(--foreground))',
    },
  },
});

export const collapsibleContent = style({
  padding: '0 5px 5px 20px',
});
