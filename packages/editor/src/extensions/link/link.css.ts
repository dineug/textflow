import { style } from '@vanilla-extract/css';

export const link = style({
  color: 'rgb(33, 111, 219)',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});
