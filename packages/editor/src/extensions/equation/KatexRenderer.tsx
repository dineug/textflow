// https://github.com/facebook/lexical/tree/main/packages/lexical-playground

import katex from 'katex';
import { useEffect, useRef } from 'react';

import * as styles from './KatexRenderer.css';

type KatexRendererProps = {
  equation: string;
  inline: boolean;
  onDoubleClick: () => void;
};

const KatexRenderer: React.FC<KatexRendererProps> = ({
  equation,
  inline,
  onDoubleClick,
}) => {
  const katexElementRef = useRef(null);

  useEffect(() => {
    const katexElement = katexElementRef.current;

    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: !inline, // true === block display //
        errorColor: '#cc0000',
        output: 'html',
        strict: 'warn',
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation, inline]);

  return (
    // We use an empty image tag either side to ensure Android doesn't try and compose from the
    // inner text from Katex. There didn't seem to be any other way of making this work,
    // without having a physical space.
    <>
      <img className={styles.img} src="#" alt="" />
      <span
        role="button"
        tabIndex={-1}
        onDoubleClick={onDoubleClick}
        ref={katexElementRef}
      />
      <img className={styles.img} src="#" alt="" />
    </>
  );
};

KatexRenderer.displayName = 'KatexRenderer';

export default KatexRenderer;
