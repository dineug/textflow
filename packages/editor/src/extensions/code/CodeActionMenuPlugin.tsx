import { autoUpdate, offset, useFloating } from '@floating-ui/react';
import { $isCodeNode, CodeNode, getLanguageFriendlyName } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/utils/clipboard';
import { useDebounce } from '@/utils/useDebounce';

import * as styles from './CodeActionMenuPlugin.css';
import { LANGUAGES } from './prism';
import * as themeStyles from './theme.css';

const CodeActionMenuContainer: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    middleware: [
      offset(({ rects }) => ({
        mainAxis: -rects.floating.width - 8,
        alignmentAxis: 4,
      })),
    ],
    whileElementsMounted: autoUpdate,
  });

  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('');
  const [isShown, setShown] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const codeSetRef = useRef<Set<string>>(new Set());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);

  const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);

  const codeFriendlyName = getLanguageFriendlyName(lang);

  const removeSuccessIcon = useDebounce(() => {
    setCopyCompleted(false);
  }, 1000);

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside) {
        setShown(false);
        setOpen(false);
        return;
      }

      if (!codeDOMNode) {
        return;
      }

      codeDOMNodeRef.current = codeDOMNode;

      let codeNode: CodeNode | null = null;
      let _lang = '';

      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() || '';
        }
      });

      if (codeNode) {
        setLang(_lang);
        setShown(true);
        refs.setReference(codeDOMNode);
      }
    },
    50,
    1000
  );

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }

    document.addEventListener('mousemove', debouncedOnMouseMove);

    return () => {
      setShown(false);
      setOpen(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener('mousemove', debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      mutations => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            switch (type) {
              case 'created':
                codeSetRef.current.add(key);
                break;

              case 'destroyed':
                codeSetRef.current.delete(key);
                break;

              default:
                break;
            }
          }
        });
        setShouldListenMouseMove(codeSetRef.current.size > 0);
      },
      { skipInitialization: false }
    );
  }, [editor]);

  const handleSelect = (currentValue: string) => {
    const codeDOMNode = codeDOMNodeRef.current;
    if (!codeDOMNode) {
      return;
    }

    editor.update(() => {
      const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(maybeCodeNode)) {
        maybeCodeNode.setLanguage(currentValue);
      }
    });
    setLang(currentValue);
    setOpen(false);
  };

  const handleCopy = () => {
    const codeDOMNode = codeDOMNodeRef.current;
    if (!codeDOMNode) {
      return;
    }

    let content = '';

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }
    });

    copyToClipboard(content);
    setCopyCompleted(true);
    removeSuccessIcon();
  };

  if (!isShown) {
    return null;
  }

  return (
    <div
      ref={refs.setFloating}
      className={styles.container}
      style={{
        ...floatingStyles,
        display: refs.reference.current ? 'inline-flex' : 'none',
        right: 0,
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            size="sm"
            className="w-[200px] justify-between"
          >
            {codeFriendlyName}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(styles.ignoreOutside, 'w-[200px] p-0')}>
          <Command>
            <CommandInput placeholder="Search language..." className="h-9" />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {LANGUAGES.map(language => (
                  <CommandItem
                    key={language.value}
                    value={language.value}
                    keywords={language.keywords}
                    onSelect={handleSelect}
                  >
                    {language.label}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        lang === language.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button className="ml-1" variant="outline" size="sm" onClick={handleCopy}>
        {isCopyCompleted ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

CodeActionMenuContainer.displayName = 'CodeActionMenuContainer';

const CodeActionMenuPlugin: React.FC = () => {
  const { $editor } = useAppContext();
  const isEditable = useLexicalEditable();

  if (!$editor || !isEditable) {
    return null;
  }

  return createPortal(<CodeActionMenuContainer />, $editor);
};

CodeActionMenuPlugin.displayName = 'CodeActionMenuPlugin';

function getMouseInfo(event: MouseEvent): {
  codeDOMNode: HTMLElement | null;
  isOutside: boolean;
} {
  const target = event.target;

  if (
    target &&
    (target instanceof HTMLElement || target instanceof SVGElement)
  ) {
    const codeDOMNode = target.closest<HTMLElement>(`code.${themeStyles.code}`);
    const isOutside = !(
      codeDOMNode ||
      target.closest<HTMLElement>(`div.${styles.container}`) ||
      target.closest<HTMLElement>(`.${styles.ignoreOutside}`)
    );

    return { codeDOMNode, isOutside };
  } else {
    return { codeDOMNode: null, isOutside: true };
  }
}

export default CodeActionMenuPlugin;
