import { style } from '@vanilla-extract/css';

export const paragraph = style({
  margin: 0,
  position: 'relative',
});

export const h1 = style({
  fontSize: 24,
  fontWeight: 400,
  margin: 0,
});
export const h2 = style({
  fontSize: 15,
  fontWeight: 700,
  margin: 0,
});
export const h3 = style({
  fontSize: 12,
  margin: 0,
});
export const h4 = style({});
export const h5 = style({});
export const h6 = style({});

export const ltr = style({
  textAlign: 'left',
});

export const rtl = style({
  textAlign: 'right',
});

export const quote = style({
  margin: 0,
  marginLeft: 20,
  marginBottom: 10,
  fontSize: 15,
  backgroundColor: 'hsl(var(--background))',
  color: 'hsl(var(--muted-foreground))',
  borderLeftColor: 'hsl(var(--border))',
  borderLeftWidth: 4,
  borderLeftStyle: 'solid',
  paddingLeft: 16,
});

export const bold = style({
  fontWeight: 'bold',
});

export const code = style({
  backgroundColor: 'hsl(var(--muted))',
  padding: '1px 0.25rem',
  fontFamily: 'Menlo, Consolas, Monaco, monospace',
  fontSize: '94%',
});

export const italic = style({
  fontStyle: 'italic',
});

export const strikethrough = style({
  textDecoration: 'line-through',
});

export const subscript = style({
  fontSize: '0.8em',
  verticalAlign: 'sub !important',
});

export const superscript = style({
  fontSize: '0.8em',
  verticalAlign: 'super',
});

export const underline = style({
  textDecoration: 'underline',
});

export const underlineStrikethrough = style({
  textDecoration: 'underline line-through',
});

export const indent = style({
  vars: {
    '--lexical-indent-base-value': '40px',
  },
});
