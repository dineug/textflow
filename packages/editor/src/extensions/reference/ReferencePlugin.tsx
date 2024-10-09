import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $wrapNodeInElement } from '@lexical/utils';
import Fuse from 'fuse.js';
import { atom, useAtom } from 'jotai';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand as lexicalCreateCommand,
  type LexicalCommand,
} from 'lexical';
import { uniqBy } from 'lodash-es';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExtensionManager } from '@/extensions/context';
import { createCommand } from '@/extensions/extensionManager';
import { cn } from '@/lib/utils';

import { ReferenceMenu, type ReferenceMenuOption } from './index';
import { $createReferenceNode, ReferenceNode } from './ReferenceNode';

const PADDING = 8;
const ITEM = 32;
const MAX_DISPLAY_ITEM = 8;
const MAX_HEIGHT = PADDING + ITEM * MAX_DISPLAY_ITEM + ITEM / 2;
const MAX_SUGGESTION_COUNT = 30;

const referenceListAtom = atom<Array<ReferenceMenuOption>>([]);

type CommandPayload = {
  title: string;
  relativePath: string;
};

export const INSERT_ANCHORING_COMMAND: LexicalCommand<CommandPayload> =
  lexicalCreateCommand('INSERT_ANCHORING_COMMAND');

export const setReferenceListCommand = createCommand<
  Array<ReferenceMenuOption>
>('setReferenceListCommand');

const ReferencePlugin: React.FC = () => {
  const { registerCommand } = useExtensionManager();
  const [editor] = useLexicalComposerContext();
  const { $root, fsPath } = useAppContext();
  const [referenceList, setReferenceList] = useAtom(referenceListAtom);
  const [queryString, setQueryString] = useState<string | null>(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('[', {
    minLength: 0,
  });

  const options: ReferenceMenu[] = useMemo(() => {
    const list = referenceList.filter(item => item.path !== fsPath);

    return queryString
      ? new Fuse(list, {
          keys: ['title', 'relativePath'],
        })
          .search(queryString, { limit: MAX_SUGGESTION_COUNT })
          .map(result => new ReferenceMenu(result.item))
      : list
          .slice(0, MAX_SUGGESTION_COUNT)
          .map(item => new ReferenceMenu(item));
  }, [referenceList, fsPath, queryString]);

  useEffect(
    () =>
      registerCommand(setReferenceListCommand, list => {
        setReferenceList(uniqBy(list, item => item.path));
      }),
    [registerCommand, setReferenceList]
  );

  useEffect(() => {
    if (!editor.hasNodes([ReferenceNode])) {
      throw new Error(
        'ReferencePlugin: ReferenceNode not registered on editor'
      );
    }

    return editor.registerCommand<CommandPayload>(
      INSERT_ANCHORING_COMMAND,
      ({ title, relativePath }) => {
        const referenceNode = $createReferenceNode({ title, relativePath });

        $insertNodes([referenceNode]);
        if ($isRootOrShadowRoot(referenceNode.getParentOrThrow())) {
          $wrapNodeInElement(referenceNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  const onSelectOption: React.ComponentProps<
    typeof LexicalTypeaheadMenuPlugin<ReferenceMenu>
  >['onSelectOption'] = useCallback(
    (selectedOption, nodeToRemove, closeMenu) => {
      editor.update(() => {
        nodeToRemove?.remove();

        editor.dispatchCommand(INSERT_ANCHORING_COMMAND, {
          title: selectedOption.title,
          relativePath: selectedOption.relativePath,
        });

        closeMenu();
      });
    },
    [editor]
  );

  if (!$root) {
    return null;
  }

  return (
    <LexicalTypeaheadMenuPlugin<ReferenceMenu>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      parent={$root}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && options.length
          ? createPortal(
              <ScrollArea
                className={cn(
                  'bg-popover text-popover-foreground z-50 w-fit min-w-32 max-w-xl overflow-hidden rounded-md border p-1 shadow-md'
                )}
                style={{
                  height: options.length > 8 ? MAX_HEIGHT : 'auto',
                }}
              >
                {options.map((option, i) => (
                  <div
                    className={cn(
                      'aria-[selected=true]:bg-accent aria-[selected=true]:text-accent-foreground relative flex cursor-default select-none items-center whitespace-nowrap rounded-sm px-2 py-1.5 text-sm outline-none'
                    )}
                    key={option.key}
                    tabIndex={-1}
                    ref={option.setRefElement}
                    role="option"
                    aria-selected={selectedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(i);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="whitespace-nowrap">{option.title}</span>
                    <span
                      className={cn(
                        'text-muted-foreground ml-auto whitespace-nowrap pl-6'
                      )}
                    >
                      {option.relativePath}
                    </span>
                  </div>
                ))}
              </ScrollArea>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
};

ReferencePlugin.displayName = 'extensionReference.Plugin';

export default ReferencePlugin;
