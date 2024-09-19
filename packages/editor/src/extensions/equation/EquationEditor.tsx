// https://github.com/facebook/lexical/tree/main/packages/lexical-playground

import { forwardRef } from 'react';

import * as styles from './EquationEditor.css';

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

const EquationEditor = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  BaseEquationEditorProps
>(({ equation, setEquation, inline }, forwardedRef) => {
  const onChange = (event: React.ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };

  return inline ? (
    <span className={styles.inlineBackground}>
      <span className={styles.dollarSign}>$</span>
      <input
        className={styles.inlineEditor}
        value={equation}
        onChange={onChange}
        ref={forwardedRef as React.RefObject<HTMLInputElement>}
      />
      <span className={styles.dollarSign}>$</span>
    </span>
  ) : (
    <div className={styles.background}>
      <span className={styles.dollarSign}>{'$$\n'}</span>
      <textarea
        className={styles.blockEditor}
        value={equation}
        onChange={onChange}
        ref={forwardedRef as React.RefObject<HTMLTextAreaElement>}
      />
      <span className={styles.dollarSign}>{'\n$$'}</span>
    </div>
  );
});

EquationEditor.displayName = 'EquationEditor';

export default EquationEditor;
