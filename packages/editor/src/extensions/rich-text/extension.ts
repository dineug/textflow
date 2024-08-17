import {
  $createHeadingNode,
  HeadingNode,
  type HeadingTagType,
  QuoteNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';

import type { RegisterExtension } from '@/extensions/extensionManager';
import type { SlashCommand } from '@/extensions/slash-command';

import * as styles from './rich-text.css';
import RichTextPlugin from './RichTextPlugin';

export const registerExtensionRichText: RegisterExtension = context => {
  context.subscriptions
    .add(context.registerNode(HeadingNode, QuoteNode))
    .add(context.registerPlugin(RichTextPlugin))
    .add(
      context.registerTheme({
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
      context.registerSlashCommand(({ editor, slashCommands }) => {
        slashCommands.push(
          ...[1, 2, 3].map<SlashCommand>(n => ({
            title: `Heading ${n}`,
            icon: null,
            keywords: ['heading', 'header', `h${n}`],
            onSelect: () => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () =>
                    $createHeadingNode(`h${n}` as HeadingTagType)
                  );
                }
              });
            },
          }))
        );
      })
    );
};
