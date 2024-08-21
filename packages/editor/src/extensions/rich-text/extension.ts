import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Pilcrow,
  Strikethrough,
  Subscript,
  Superscript,
  TextQuote,
  Underline,
} from 'lucide-react';

import type { RegisterExtension } from '@/extensions/extensionManager';
import type { SlashCommand } from '@/extensions/slash-command';

import RichTextPlugin from './RichTextPlugin';
import * as styles from './theme.css';

type HeadingLevel = 1 | 2 | 3;
type TextAlign = 'left' | 'center' | 'right' | 'justify';

const HEADING_LEVEL_SLASH_COMMANDS: HeadingLevel[] = [1, 2, 3];

const HEADING_ICON_MAP = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
};

const TEXT_ALIGN_SLASH_COMMANDS: TextAlign[] = [
  'left',
  'center',
  'right',
  'justify',
];

const TEXT_ALIGN_ICON_MAP = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

export const registerExtensionRichText: RegisterExtension = ({
  subscriptions,
  registerNode,
  registerPlugin,
  registerTheme,
  registerSlashCommand,
  registerFloatingTextFormatButton,
}) => {
  subscriptions
    .add(registerNode(HeadingNode, QuoteNode))
    .add(registerPlugin(RichTextPlugin))
    .add(
      registerTheme({
        paragraph: styles.paragraph,
        heading: {
          h1: styles.h1,
          h2: styles.h2,
          h3: styles.h3,
          h4: styles.h4,
          h5: styles.h5,
          h6: styles.h6,
        },
        ltr: styles.ltr,
        rtl: styles.rtl,
        quote: styles.quote,
        text: {
          bold: styles.bold,
          code: styles.code,
          italic: styles.italic,
          strikethrough: styles.strikethrough,
          subscript: styles.subscript,
          superscript: styles.superscript,
          underline: styles.underline,
          underlineStrikethrough: styles.underlineStrikethrough,
        },
        indent: styles.indent,
      })
    )
    .add(
      registerSlashCommand(({ editor, registerCommands }) => {
        registerCommands(
          [
            {
              title: 'Paragraph',
              Icon: Pilcrow,
              keywords: ['normal', 'paragraph', 'p', 'text'],
              onSelect: () => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                  }
                });
              },
            },
            ...HEADING_LEVEL_SLASH_COMMANDS.map<SlashCommand>(n => ({
              title: `Heading ${n}`,
              Icon: HEADING_ICON_MAP[n],
              keywords: ['heading', 'header', `h${n}`],
              onSelect: () => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () =>
                      $createHeadingNode(`h${n}`)
                    );
                  }
                });
              },
            })),
          ],
          0
        );
        registerCommands(
          [
            {
              title: 'Quote',
              Icon: TextQuote,
              keywords: ['block quote'],
              onSelect: () => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                  }
                });
              },
            },
          ],
          1
        );
        registerCommands(
          TEXT_ALIGN_SLASH_COMMANDS.map(alignment => ({
            title: `Align ${alignment}`,
            Icon: TEXT_ALIGN_ICON_MAP[alignment],
            keywords: ['align', 'justify', alignment],
            onSelect: () => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
            },
          })),
          999
        );
      })
    )
    .add(
      registerFloatingTextFormatButton(
        {
          Icon: Bold,
          $hasFormat: selection => selection.hasFormat('bold'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          },
        },
        {
          Icon: Italic,
          $hasFormat: selection => selection.hasFormat('italic'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          },
        },
        {
          Icon: Underline,
          $hasFormat: selection => selection.hasFormat('underline'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          },
        },
        {
          Icon: Strikethrough,
          $hasFormat: selection => selection.hasFormat('strikethrough'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          },
        },
        {
          Icon: Subscript,
          $hasFormat: selection => selection.hasFormat('subscript'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
          },
        },
        {
          Icon: Superscript,
          $hasFormat: selection => selection.hasFormat('superscript'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
          },
        },
        {
          Icon: Code,
          $hasFormat: selection => selection.hasFormat('code'),
          onClick: editor => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          },
        }
      )
    );
};
