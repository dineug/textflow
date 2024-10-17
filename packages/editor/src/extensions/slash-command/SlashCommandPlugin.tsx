import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExtensionManager } from '@/extensions/context';
import { cn } from '@/lib/utils';

import {
  type SlashCommand,
  type SlashCommandContext,
  SlashCommandMenu,
} from './index';

const PADDING = 8;
const ITEM = 32;
const MAX_DISPLAY_ITEM = 8;
const MAX_HEIGHT = PADDING + ITEM * MAX_DISPLAY_ITEM + ITEM / 2;

const SlashCommandPlugin: React.FC = () => {
  const { getSlashCommands } = useExtensionManager();
  const [editor] = useLexicalComposerContext();
  const { $root } = useAppContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });
  const registers = useMemo(() => [...getSlashCommands()], [getSlashCommands]);
  const [options, setOptions] = useState<Array<SlashCommandMenu>>([]);

  useEffect(() => {
    const priorityCommandsMap = new Map<number, Set<SlashCommand>>();
    let cancel = false;

    const calcCommands = () => {
      if (cancel) return;

      const commands = [...priorityCommandsMap.entries()]
        .sort(([a], [b]) => a - b)
        .reduce((acc: SlashCommand[], [__priority, commands]) => {
          acc.push(...[...commands.values()]);
          return acc;
        }, []);

      if (!queryString) {
        setOptions(commands.map(command => new SlashCommandMenu(command)));
        return;
      }

      const fuse = new Fuse(commands, {
        keys: ['title', 'keywords'],
        threshold: 0.4,
      });
      setOptions(
        fuse
          .search(queryString)
          .map(result => new SlashCommandMenu(result.item))
      );
    };

    const context: SlashCommandContext = {
      editor,
      queryString: queryString ?? '',
      registerCommands: (commands, priority) => {
        const accCommands = priorityCommandsMap.get(priority) ?? new Set();
        commands.forEach(command => accCommands.add(command));
        priorityCommandsMap.set(priority, accCommands);
        calcCommands();
      },
    };
    registers.forEach(register => register(context));

    return () => {
      cancel = true;
      setOptions([]);
      priorityCommandsMap.clear();
    };
  }, [editor, queryString, registers]);

  const onSelectOption: React.ComponentProps<
    typeof LexicalTypeaheadMenuPlugin<SlashCommandMenu>
  >['onSelectOption'] = useCallback(
    (selectedOption, nodeToRemove, closeMenu, matchingString) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  if (!$root) {
    return null;
  }

  return (
    <LexicalTypeaheadMenuPlugin<SlashCommandMenu>
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
                  'bg-popover text-popover-foreground z-50 w-52 min-w-32 overflow-hidden rounded-md border p-1 shadow-md'
                )}
                style={{
                  height: options.length > 8 ? MAX_HEIGHT : 'auto',
                }}
              >
                {options.map((option, i) => (
                  <div
                    className={cn(
                      'aria-[selected=true]:bg-muted aria-[selected=true]:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none'
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
                    {option.Icon && <option.Icon className="mr-2 h-4 w-4" />}
                    <span>{option.title}</span>
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

SlashCommandPlugin.displayName = 'extensionSlashCommand.Plugin';

export default SlashCommandPlugin;
