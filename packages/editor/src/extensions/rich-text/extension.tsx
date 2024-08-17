import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './rich-text.css';

export const registerExtensionRichText: RegisterExtension = context => {
  const RichTextPlugin: React.FC = () => <TabIndentationPlugin />;
  RichTextPlugin.displayName = 'RichTextPlugin';

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
    );
};
