import { style } from '@vanilla-extract/css';

export const code = style({
  backgroundColor: 'hsl(var(--code))',
  fontFamily: 'Menlo, Consolas, Monaco, monospace',
  display: 'block',
  padding: '8px 8px 8px 52px',
  lineHeight: '1.53',
  fontSize: '13px',
  margin: 0,
  marginTop: 8,
  marginBottom: 8,
  overflowX: 'auto',
  position: 'relative',
  tabSize: 2,
  ':before': {
    content: 'attr(data-gutter)',
    position: 'absolute',
    backgroundColor: 'hsl(var(--code-line-number))',
    left: 0,
    top: 0,
    borderRight: '1px solid hsl(var(--code-line-number-border))',
    padding: 8,
    color: 'hsl(var(--code-line-number-foreground))',
    whiteSpace: 'pre-wrap',
    textAlign: 'right',
    minWidth: 25,
  },
});

export const tokenComment = style({
  color: 'hsl(var(--code-comment))',
});
export const tokenPunctuation = style({
  color: 'hsl(var(--code-punctuation))',
});
export const tokenProperty = style({
  color: 'hsl(var(--code-property))',
});
export const tokenSelector = style({
  color: 'hsl(var(--code-selector))',
});
export const tokenOperator = style({
  color: 'hsl(var(--code-operator))',
});
export const tokenAttr = style({
  color: 'hsl(var(--code-attr))',
});
export const tokenVariable = style({
  color: 'hsl(var(--code-variable))',
});
export const tokenFunction = style({
  color: 'hsl(var(--code-function))',
});
