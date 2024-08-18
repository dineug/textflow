import { style } from '@vanilla-extract/css';

export const checklist = style({});

export const listitem = style({
  margin: '0 32px',
});

const baseListItem = style({
  position: 'relative',
  marginLeft: 8,
  marginRight: 8,
  paddingLeft: 24,
  paddingRight: 24,
  listStyleType: 'none',
  outline: 'none',
});

export const listitemChecked = style([
  baseListItem,
  {
    textDecoration: 'line-through',
    ':before': {
      content: '',
      width: 16,
      height: 16,
      top: 2,
      left: 0,
      cursor: 'pointer',
      display: 'block',
      backgroundSize: 'cover',
      position: 'absolute',
      border: '1px solid hsl(var(--ring))',
      borderRadius: 2,
      backgroundColor: 'hsl(var(--primary))',
      backgroundRepeat: 'no-repeat',
    },
    ':after': {
      content: '',
      cursor: 'pointer',
      borderColor: 'hsl(var(--primary-foreground))',
      borderStyle: 'solid',
      position: 'absolute',
      display: 'block',
      top: 6,
      width: 3,
      left: 7,
      right: 7,
      height: 6,
      transform: 'rotate(45deg)',
      borderWidth: '0 2px 2px 0',
    },
    selectors: {
      '&[dir="rtl"]:before': {
        left: 'auto',
        right: 0,
      },
    },
  },
]);

export const listitemUnchecked = style([
  baseListItem,
  {
    ':before': {
      content: '',
      width: 16,
      height: 16,
      top: 2,
      left: 0,
      cursor: 'pointer',
      display: 'block',
      backgroundSize: 'cover',
      position: 'absolute',
      border: '1px solid hsl(var(--ring))',
      borderRadius: 2,
    },
    selectors: {
      '&[dir="rtl"]:before': {
        left: 'auto',
        right: 0,
      },
    },
  },
]);

export const nestedListItem = style({
  listStyleType: 'none',
  ':before': {
    display: 'none',
  },
  ':after': {
    display: 'none',
  },
});

const baseList = style({
  padding: 0,
  margin: 0,
  listStylePosition: 'outside',
});

export const ul = style([
  baseList,
  {
    selectors: {
      '&': {
        listStyle: 'disc',
      },
      '& &': {
        listStyle: 'circle',
      },
      '& & &': {
        listStyle: 'square',
      },
    },
  },
]);

export const olDepth1 = style([
  baseList,
  {
    listStyleType: 'decimal',
  },
]);
export const olDepth2 = style([
  baseList,
  {
    listStyleType: 'upper-alpha',
  },
]);
export const olDepth3 = style([
  baseList,
  {
    listStyleType: 'lower-alpha',
  },
]);
export const olDepth4 = style([
  baseList,
  {
    listStyleType: 'upper-roman',
  },
]);
export const olDepth5 = style([
  baseList,
  {
    listStyleType: 'lower-roman',
  },
]);
