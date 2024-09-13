import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useEffect } from 'react';

const ClickableLinkPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      const disabled = isEditable && !(event.metaKey || event.ctrlKey);

      if (target instanceof HTMLElement) {
        const a = target.closest('a');
        if (!a) return;

        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    return editor.registerRootListener((rootElement, prevRootElement) => {
      if (prevRootElement !== null) {
        prevRootElement.removeEventListener('click', handleClick);
      }
      if (rootElement !== null) {
        rootElement.addEventListener('click', handleClick);
      }
    });
  }, [editor, isEditable]);

  return null;
};

ClickableLinkPlugin.displayName = 'ClickableLinkPlugin';

export default ClickableLinkPlugin;
