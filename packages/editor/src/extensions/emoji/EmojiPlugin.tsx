import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import Fuse from 'fuse.js';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Emoji } from '@/utils/emoji-list';
import { withSuspense } from '@/utils/withSuspense';

import { EmojiMenuOption } from './index';

const PADDING = 8;
const ITEM = 32;
const MAX_DISPLAY_ITEM = 8;
const MAX_HEIGHT = PADDING + ITEM * MAX_DISPLAY_ITEM + ITEM / 2;
const MAX_EMOJI_SUGGESTION_COUNT = 30;

const EmojiPlugin: React.FC = () => {
  const emojiList = useEmojiList();
  const [editor] = useLexicalComposerContext();
  const { $root } = useAppContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(':', {
    minLength: 0,
  });

  const options = useMemo(() => {
    return queryString
      ? EmojiListRepository.getInstance(emojiList)
          .fuse.search(queryString, {
            limit: MAX_EMOJI_SUGGESTION_COUNT,
          })
          .map(result => result.item)
      : [];
  }, [queryString, emojiList]);

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiMenuOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selectedOption == null) {
          return;
        }

        nodeToRemove?.remove();
        selection.insertNodes([$createTextNode(selectedOption.emoji)]);
        closeMenu();
      });
    },
    [editor]
  );

  if (!$root) {
    return null;
  }

  return (
    <LexicalTypeaheadMenuPlugin<EmojiMenuOption>
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
                className="w-max"
                style={{
                  height: options.length > 8 ? MAX_HEIGHT : 'auto',
                }}
              >
                <div
                  className={cn(
                    'bg-popover text-popover-foreground z-50 w-72 min-w-32 overflow-hidden rounded-md border p-1 shadow-md'
                  )}
                >
                  {options.map((option, i) => (
                    <div
                      className={cn(
                        'aria-[selected=true]:bg-accent aria-[selected=true]:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none'
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
                      <span className="mr-2 h-4 w-4">{option.emoji}</span>
                      <span>{option.title}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
};

EmojiPlugin.displayName = 'extensionEmoji.Plugin';

function useEmojiList() {
  const [promise, setPromise] = useState<Promise<void>>();
  const [status, setStatus] = useState<'pending' | 'fulfilled' | 'rejected'>(
    'pending'
  );
  const [error, setError] = useState<Error>();
  const [emojiList, setEmojiList] = useState<ReadonlyArray<Emoji>>([]);

  useEffect(() => {
    setStatus('pending');
    setPromise(
      import('@/utils/emoji-list').then(
        mod => {
          setEmojiList(mod.EMOJI_LIST);
          setStatus('fulfilled');
        },
        (error: Error) => {
          setError(error);
          setStatus('rejected');
        }
      )
    );
  }, []);

  if (status === 'pending' && promise) {
    throw promise;
  }
  if (status === 'rejected') {
    throw error;
  }
  return emojiList;
}

class EmojiListRepository {
  private static instance: EmojiListRepository;
  static getInstance(emojiList: ReadonlyArray<Emoji>): EmojiListRepository {
    if (!EmojiListRepository.instance) {
      EmojiListRepository.instance = new EmojiListRepository(emojiList);
    }

    return EmojiListRepository.instance;
  }

  options: EmojiMenuOption[];
  fuse: Fuse<EmojiMenuOption>;

  private constructor(emojiList: ReadonlyArray<Emoji>) {
    this.options = emojiList.map(
      emoji =>
        new EmojiMenuOption({
          title: emoji.description,
          emoji: emoji.emoji,
          keywords: emoji.aliases,
          tags: emoji.tags,
        })
    );
    this.fuse = new Fuse(this.options, {
      keys: ['keywords', 'tags'],
    });
  }
}

export default withSuspense(EmojiPlugin);
