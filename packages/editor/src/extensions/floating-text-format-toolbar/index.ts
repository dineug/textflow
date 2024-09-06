import type { LexicalEditor, RangeSelection } from 'lexical';

export type FloatingTextFormatButton = {
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
  $hasFormat: (selection: RangeSelection) => boolean;
  onClick: (editor: LexicalEditor, isFormat: boolean) => void;
};
