import { style } from '@vanilla-extract/css';

export const code = style({
  backgroundColor: 'rgb(240, 242, 245)',
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
    backgroundColor: '#eee',
    left: 0,
    top: 0,
    borderRight: '1px solid #ccc',
    padding: 8,
    color: '#777',
    whiteSpace: 'pre-wrap',
    textAlign: 'right',
    minWidth: 25,
  },
});

export const tokenComment = style({
  color: 'slategray',
});
export const tokenPunctuation = style({
  color: '#999',
});
export const tokenProperty = style({
  color: '#905',
});
export const tokenSelector = style({
  color: '#690',
});
export const tokenOperator = style({
  color: '#9a6e3a',
});
export const tokenAttr = style({
  color: '#07a',
});
export const tokenVariable = style({
  color: '#e90',
});
export const tokenFunction = style({
  color: '#dd4a68',
});
