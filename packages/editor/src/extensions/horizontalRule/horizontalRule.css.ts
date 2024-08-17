import { globalStyle, style } from '@vanilla-extract/css';

export const hr = style({
  padding: '2px 2px',
  border: 'none',
  margin: '1em 0',
  cursor: 'pointer',
  ':after': {
    content: '',
    display: 'block',
    height: 2,
    backgroundColor: '#ccc',
    lineHeight: 2,
  },
});
globalStyle(`${hr}.selected`, {
  outline: '2px solid rgb(60, 132, 244)',
  userSelect: 'none',
});
