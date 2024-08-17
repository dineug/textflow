import { AutoLinkNode, LinkNode } from '@lexical/link';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './link.css';

export const registerExtensionLink: RegisterExtension = context => {
  context.subscriptions.add(context.registerNode(AutoLinkNode, LinkNode)).add(
    context.registerTheme({
      link: styles.link,
    })
  );
};
