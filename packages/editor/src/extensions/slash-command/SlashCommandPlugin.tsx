import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { MenuContent, MenuItem } from '@/components/menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExtensionManagerContext } from '@/extensions/context';

import { SlashCommandMenu } from './index';

const PADDING = 8;
const ITEM = 32;
const MAX_DISPLAY_ITEM = 8;
const MAX_HEIGHT = PADDING + ITEM * MAX_DISPLAY_ITEM + ITEM / 2;

const SlashCommandPlugin: React.FC = () => {
  const { getSlashCommands } = useExtensionManagerContext();
  const [editor] = useLexicalComposerContext();
  const { root } = useAppContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () => getSlashCommands(editor, queryString || ''),
    [editor, getSlashCommands, queryString]
  );

  const onSelectOption = useCallback(
    (
      selectedOption: SlashCommandMenu,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  if (!root) {
    return null;
  }

  return (
    <LexicalTypeaheadMenuPlugin<SlashCommandMenu>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      parent={root}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && options.length
          ? createPortal(
              <ScrollArea
                className="w-max"
                style={{
                  height: options.length > 8 ? MAX_HEIGHT : 'auto',
                }}
              >
                <MenuContent className="w-[200px]">
                  {options.map((option, i) => (
                    <MenuItem
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
                      {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                      <span>{option.title}</span>
                    </MenuItem>
                  ))}
                </MenuContent>
              </ScrollArea>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
};

SlashCommandPlugin.displayName = 'SlashCommandPlugin';

export default SlashCommandPlugin;
