import { flip, offset, useFloating } from '@floating-ui/react';
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { atom, useAtom, useSetAtom } from 'jotai';
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  type BaseSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExtensionManager } from '@/extensions/context';
import { createCommand } from '@/extensions/extensionManager';
import { cn } from '@/lib/utils';
import { getSelectedNode } from '@/utils/getSelectedNode';
import { sanitizeUrl } from '@/utils/url';

const isLinkAtom = atom(false);

export const linkEditModeCommand = createCommand<boolean>(
  'linkEditModeCommand'
);

const FloatingLinkEditorPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const { $editor } = useAppContext();
  const setIsLink = useSetAtom(isLinkAtom);

  useEffect(() => {
    const $updateToolbar = () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      const focusNode = getSelectedNode(selection);
      const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
      const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode);
      if (!(focusLinkNode || focusAutoLinkNode)) {
        setIsLink(false);
        return;
      }

      const badNode = selection
        .getNodes()
        .filter(node => !$isLineBreakNode(node))
        .find(node => {
          const linkNode = $findMatchingParent(node, $isLinkNode);
          const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
          return (
            (focusLinkNode && !focusLinkNode.is(linkNode)) ||
            (linkNode && !linkNode.is(focusLinkNode)) ||
            (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
            (autoLinkNode &&
              (!autoLinkNode.is(focusAutoLinkNode) ||
                autoLinkNode.getIsUnlinked()))
          );
        });

      if (!badNode) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    };

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, setIsLink]);

  if (!$editor) {
    return null;
  }

  return createPortal(<FloatingLinkEditor />, $editor);
};

FloatingLinkEditorPlugin.displayName = 'FloatingLinkEditorPlugin';

const FloatingLinkEditor: React.FC = () => {
  const { registerCommand } = useExtensionManager();
  const [editor] = useLexicalComposerContext();
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(() => 10), flip()],
  });

  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLink, setIsLink] = useAtom(isLinkAtom);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [editedLinkUrl, setEditedLinkUrl] = useState('https://');
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
    null
  );

  useEffect(
    () =>
      registerCommand(linkEditModeCommand, payload => {
        setIsLinkEditMode(payload);
      }),
    [registerCommand]
  );

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        setLinkUrl(linkParent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }

      if (isLinkEditMode) {
        setEditedLinkUrl(linkUrl);
      }
    }

    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;
    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const reference = nativeSelection.focusNode?.parentElement;

      if (reference) {
        refs.setReference(reference);
        setShow(true);
      }

      setLastSelection(selection);
    } else if (
      !activeElement ||
      !activeElement.classList.contains('link-input')
    ) {
      if (rootElement !== null) {
        refs.setReference(null);
        setShow(false);
      }

      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [editor, isLinkEditMode, linkUrl, refs]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [$updateLinkEditor, editor, isLink, setIsLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor();
    });
  }, [$updateLinkEditor, editor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkUrl !== '') {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(parent.getURL(), {
                rel: parent.__rel,
                target: parent.__target,
                title: parent.__title,
              });
              parent.replace(linkNode, true);
            }
          }
        });
      }
      setEditedLinkUrl('https://');
      setIsLinkEditMode(false);
    }
  };

  return (
    <Card
      className={cn('flex w-full max-w-96 items-center gap-1 px-3 py-2')}
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        display: show && isLink ? 'flex' : 'none',
      }}
    >
      {!isLink ? null : isLinkEditMode ? (
        <>
          <Input
            ref={inputRef}
            className="link-input"
            value={editedLinkUrl}
            onChange={event => {
              setEditedLinkUrl(event.target.value);
            }}
            onKeyDown={event => {
              monitorInputInteraction(event);
            }}
          />
          <div className={cn('ml-auto flex items-center gap-1')}>
            <Button
              variant="ghost"
              onMouseDown={event => event.preventDefault()}
              onClick={handleLinkSubmission}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                setIsLinkEditMode(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <a
            className={cn(
              'inline-flex min-h-9 w-full items-center overflow-hidden border border-transparent px-3 py-1 pt-[5px]',
              'text-sm underline-offset-4 hover:underline'
            )}
            style={{
              wordBreak: 'break-word',
            }}
            href={sanitizeUrl(linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkUrl}
          </a>
          <div className={cn('ml-auto flex items-center gap-1')}>
            <Button
              variant="ghost"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                setEditedLinkUrl(linkUrl);
                setIsLinkEditMode(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

FloatingLinkEditor.displayName = 'FloatingLinkEditor';

export default FloatingLinkEditorPlugin;
