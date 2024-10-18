import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

type ReadonlyPluginProps = {
  readonly?: boolean;
};

const ReadonlyPlugin: React.FC<ReadonlyPluginProps> = ({ readonly }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!readonly);
  }, [editor, readonly]);

  return null;
};

ReadonlyPlugin.displayName = 'ReadonlyPlugin';

export default ReadonlyPlugin;
