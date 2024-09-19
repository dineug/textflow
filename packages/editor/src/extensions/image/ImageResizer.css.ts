import { style } from '@vanilla-extract/css';

const base = style({
  display: 'block',
  width: 7,
  height: 7,
  position: 'absolute',
  backgroundColor: 'hsl(var(--primary))',
  border: '1px solid hsl(var(--ring))',
});

export const n = style([
  base,
  {
    top: -6,
    left: '48%',
    cursor: 'n-resize',
  },
]);

export const ne = style([
  base,
  {
    top: -6,
    right: -6,
    cursor: 'ne-resize',
  },
]);

export const e = style([
  base,
  {
    bottom: '48%',
    right: -6,
    cursor: 'e-resize',
  },
]);

export const se = style([
  base,
  {
    bottom: -6,
    right: -6,
    cursor: 'nwse-resize',
  },
]);

export const s = style([
  base,
  {
    bottom: -6,
    left: '48%',
    cursor: 's-resize',
  },
]);

export const sw = style([
  base,
  {
    bottom: -6,
    left: -6,
    cursor: 'sw-resize',
  },
]);

export const w = style([
  base,
  {
    bottom: '48%',
    left: -6,
    cursor: 'w-resize',
  },
]);

export const nw = style([
  base,
  {
    top: -6,
    left: -6,
    cursor: 'nw-resize',
  },
]);

export const resizing = style({
  touchAction: 'none',
});
