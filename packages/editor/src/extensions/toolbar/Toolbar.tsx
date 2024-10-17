import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { $isLinkNode } from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  type HeadingTagType,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  IS_APPLE,
  mergeRegister,
} from '@lexical/utils';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { atom, useAtomValue } from 'jotai';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  type LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  RotateCcw,
  RotateCw,
  TextQuote,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { useAppContext } from '@/components/app-context';
import * as editorComposerStyles from '@/components/editor-composer/EditorComposer.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getSelectedNode } from '@/utils/getSelectedNode';

import * as styles from './Toolbar.css';

export const enableToolbarAtom = atom(false);

const PADDING_TOP = 8;

type BlockType = {
  id: string;
  name: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
  onClick: (editor: LexicalEditor, blockType: string) => void;
};

type AlignmentType = {
  id: string;
  name: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
  onClick: (editor: LexicalEditor) => void;
};

// TODO: extension interface
const Toolbar: React.FC = () => {
  const enableToolbar = useAtomValue(enableToolbarAtom);
  const [editor] = useLexicalComposerContext();
  const { $root } = useAppContext();

  const isEditable = useLexicalEditable();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

  useLayoutEffect(() => {
    if (!$root) return;

    const styleVars = assignInlineVars({
      [editorComposerStyles.paddingTopVar]: `${PADDING_TOP}px`,
    });

    if (enableToolbar) {
      Object.entries(styleVars).forEach(([cssVarName, value]) => {
        $root.style.setProperty(cssVarName, value);
      });
    } else {
      Object.keys(styleVars).forEach(cssVarName => {
        $root.style.removeProperty(cssVarName);
      });
    }

    return () => {
      Object.keys(styleVars).forEach(cssVarName => {
        $root.style.removeProperty(cssVarName);
      });
    };
  }, [$root, enableToolbar]);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, e => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (blockTypeSet.has(type)) {
            setBlockType(type);
          }
          if ($isCodeNode(element)) {
            return;
          }
        }
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      let matchingParent;

      if ($isLinkNode(parent)) {
        matchingParent = $findMatchingParent(
          node,
          parentNode => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left'
      );
    }
  }, [editor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateToolbar();
    });

    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, $updateToolbar]);

  if (!enableToolbar || !isEditable) {
    return <div className={styles.toolbarLayout} />;
  }

  return (
    <div className={styles.toolbarLayout}>
      <div className={cn(styles.toolbar, 'space-x-1 border-b')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canUndo || !isEditable}
              onClick={() => {
                editor.dispatchCommand(UNDO_COMMAND, undefined);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canRedo || !isEditable}
              onClick={() => {
                editor.dispatchCommand(REDO_COMMAND, undefined);
              }}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)'}
          </TooltipContent>
        </Tooltip>

        <div className="h-6 px-1">
          <Separator orientation="vertical" />
        </div>

        {blockTypeSet.has(blockType) &&
          BLOCKS.map(({ id, name, Icon, onClick }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Toggle
                  disabled={!isEditable}
                  pressed={id === blockType}
                  onPressedChange={() => onClick(editor, blockType)}
                >
                  <Icon className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          ))}

        <div className="h-6 px-1">
          <Separator orientation="vertical" />
        </div>

        {ALIGNMENTS.map(({ id, name, Icon, onClick }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Toggle
                disabled={!isEditable}
                pressed={id === elementFormat}
                onPressedChange={() => onClick(editor)}
              >
                <Icon className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

Toolbar.displayName = 'Toolbar';

const BLOCKS: BlockType[] = [
  {
    id: 'paragraph',
    name: 'Normal',
    Icon: Pilcrow,
    onClick: formatParagraph,
  },
  {
    id: 'h1',
    name: 'Heading 1',
    Icon: Heading1,
    onClick: (editor, blockType) => formatHeading(editor, blockType, 'h1'),
  },
  {
    id: 'h2',
    name: 'Heading 2',
    Icon: Heading2,
    onClick: (editor, blockType) => formatHeading(editor, blockType, 'h2'),
  },
  {
    id: 'h3',
    name: 'Heading 3',
    Icon: Heading3,
    onClick: (editor, blockType) => formatHeading(editor, blockType, 'h3'),
  },
  {
    id: 'number',
    name: 'Numbered List',
    Icon: ListOrdered,
    onClick: (editor, blockType) => {
      if (blockType !== 'number') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      } else {
        formatParagraph(editor);
      }
    },
  },
  {
    id: 'bullet',
    name: 'Bulleted List',
    Icon: List,
    onClick: (editor, blockType) => {
      if (blockType !== 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else {
        formatParagraph(editor);
      }
    },
  },
  {
    id: 'check',
    name: 'Check List',
    Icon: ListChecks,
    onClick: (editor, blockType) => {
      if (blockType !== 'check') {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      } else {
        formatParagraph(editor);
      }
    },
  },
  {
    id: 'quote',
    name: 'Quote',
    Icon: TextQuote,
    onClick: (editor, blockType) => {
      if (blockType !== 'quote') {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createQuoteNode());
        });
      }
    },
  },
  {
    id: 'code',
    name: 'Code Block',
    Icon: Code,
    onClick: (editor, blockType) => {
      if (blockType !== 'code') {
        editor.update(() => {
          let selection = $getSelection();

          if (selection !== null) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode('plain'));
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode('plain');
              selection.insertNodes([codeNode]);
              selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertRawText(textContent);
              }
            }
          }
        });
      }
    },
  },
];

const blockTypeSet = new Set(BLOCKS.map(({ id }) => id));

function formatParagraph(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
}

function formatHeading(
  editor: LexicalEditor,
  blockType: string,
  headingSize: HeadingTagType
) {
  if (blockType !== headingSize) {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    });
  }
}

const ALIGNMENTS: AlignmentType[] = [
  {
    id: 'left',
    name: 'Left Align',
    Icon: AlignLeft,
    onClick: editor => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
    },
  },
  {
    id: 'center',
    name: 'Center Align',
    Icon: AlignCenter,
    onClick: editor => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
    },
  },
  {
    id: 'right',
    name: 'Right Align',
    Icon: AlignRight,
    onClick: editor => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
    },
  },
  {
    id: 'justify',
    name: 'Justify Align',
    Icon: AlignJustify,
    onClick: editor => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
    },
  },
];

export default Toolbar;
