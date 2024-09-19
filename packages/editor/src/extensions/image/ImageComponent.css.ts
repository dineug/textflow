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
  outline: '2px solid rgb(60, 132, 244)',
  userSelect: 'none',
});

export const draggable = style({
  cursor: 'grab',
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});
