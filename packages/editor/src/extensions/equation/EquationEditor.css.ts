import { style } from '@vanilla-extract/css';

export const background = style({
  backgroundColor: 'hsl(var(--muted))',
});

export const inlineBackground = style([
  background,
  {
    display: 'inline-block',
  },
]);

export const dollarSign = style({
  textAlign: 'left',
  color: 'hsl(var(--muted-foreground))',
});

export const inlineEditor = style({
  padding: 0,
  margin: 0,
  border: 0,
  outline: 0,
  backgroundColor: 'inherit',
});

export const blockEditor = style([
  inlineEditor,
  {
    resize: 'none',
    width: '100%',
  },
]);
