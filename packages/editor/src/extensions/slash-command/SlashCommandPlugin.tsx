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
import { useExtensionManagerContext } from '@/extensions/context';

import { SlashCommandMenu } from './index';

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

  return (
    <LexicalTypeaheadMenuPlugin<SlashCommandMenu>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      parent={root.current ?? undefined}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && options.length
          ? createPortal(
              <MenuContent>
                {options.map((option, i) => (
                  <MenuItem
                    key={option.key}
                    data-selected={selectedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(i);
                    }}
                  >
                    {option.title}
                  </MenuItem>
                ))}
              </MenuContent>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
};

SlashCommandPlugin.displayName = 'SlashCommandPlugin';

export default SlashCommandPlugin;
