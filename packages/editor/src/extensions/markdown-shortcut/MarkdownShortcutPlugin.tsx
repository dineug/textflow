import {
  DEFAULT_TRANSFORMERS,
  MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin,
} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useMemo } from 'react';

import { useExtensionManagerContext } from '@/extensions/context';

const MarkdownShortcutPlugin: React.FC = () => {
  const { getTransformers } = useExtensionManagerContext();
  const transformers = useMemo(
    () => [...getTransformers(), ...DEFAULT_TRANSFORMERS],
    [getTransformers]
  );

  return <LexicalMarkdownShortcutPlugin transformers={transformers} />;
};

MarkdownShortcutPlugin.displayName = 'MarkdownShortcutPlugin';

export default MarkdownShortcutPlugin;
