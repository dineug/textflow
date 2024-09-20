import { style } from '@vanilla-extract/css';

export const img = style({
  maxWidth: '100%',
  cursor: 'default',
});

export const brokenImage = style([
  img,
  {
    height: 200,
    opacity: 0.2,
    width: 200,
  },
]);

export const focused = style({
  outline: '2px solid hsl(var(--ring))',
  userSelect: 'none',
});

export const draggable = style({
  cursor: 'grab',
  ':active': {
    cursor: 'grabbing',
  },
});
