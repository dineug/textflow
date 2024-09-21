import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { $isCodeHighlightNode } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { Toggle } from '@/components/ui/toggle';
import { useExtensionManager } from '@/extensions/context';
import { cn } from '@/lib/utils';
import { getSelectedNode } from '@/utils/getSelectedNode';

import type { FloatingTextFormatButton } from './index';

const FloatingTextFormatToolbarPlugin: React.FC = () => {
  const { getFloatingTextFormatButtons } = useExtensionManager();
  const [editor] = useLexicalComposerContext();
  const { $editor } = useAppContext();
  const buttons = useMemo(
    () => [...getFloatingTextFormatButtons()],
    [getFloatingTextFormatButtons]
  );
  const [isText, setIsText] = useState(false);
  const [isFormatMap, setIsFormatMap] = useState<Record<number, boolean>>({});

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return;
      }

      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      setIsFormatMap(
        buttons.reduce((acc: Record<number, boolean>, button, index) => {
          acc[index] = button.$hasFormat(selection);
          return acc;
        }, {})
      );

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
        return;
      }
    });
  }, [buttons, editor]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup);
    return () => {
      document.removeEventListener('selectionchange', updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText || !$editor) {
    return null;
  }

  return createPortal(
    <FloatingTextFormatToolbar buttons={buttons} isFormatMap={isFormatMap} />,
    $editor
  );
};

FloatingTextFormatToolbarPlugin.displayName =
  'extensionFloatingTextFormatToolbar.Plugin';

type FloatingTextFormatToolbarProps = {
  buttons: FloatingTextFormatButton[];
  isFormatMap: Record<number, boolean>;
};

const FloatingTextFormatToolbar: React.FC<FloatingTextFormatToolbarProps> = ({
  buttons,
  isFormatMap,
}) => {
  const [editor] = useLexicalComposerContext();
  const { refs, floatingStyles } = useFloating({
    placement: 'top-start',
    middleware: [offset(() => 10), flip()],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    const $updateTextFormatFloatingToolbar = () => {
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        selection !== null &&
        nativeSelection !== null &&
        !nativeSelection.isCollapsed &&
        rootElement !== null &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const reference = nativeSelection.getRangeAt(0);
        refs.setReference(reference);
      }
    };

    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, refs]);

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        visibility: refs.reference.current ? 'visible' : 'hidden',
      }}
      className={cn(
        'bg-popover text-popover-foreground z-50 overflow-hidden rounded-md border p-1 shadow-md',
        'flex items-center justify-center gap-1'
      )}
    >
      {buttons.map((button, index) => (
        <Toggle
          key={index}
          size="sm"
          pressed={isFormatMap[index]}
          onPressedChange={() => button.onClick(editor, isFormatMap[index])}
        >
          <button.Icon className="h-4 w-4" />
        </Toggle>
      ))}
    </div>
  );
};

FloatingTextFormatToolbar.displayName = 'FloatingTextFormatToolbar';

export default FloatingTextFormatToolbarPlugin;
