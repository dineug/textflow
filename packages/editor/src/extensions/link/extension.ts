import { AutoLinkNode, LinkNode } from '@lexical/link';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './theme.css';

export const registerExtensionLink: RegisterExtension = ({
  subscriptions,
  registerNode,
  registerTheme,
}) => {
  subscriptions.add(registerNode(AutoLinkNode, LinkNode)).add(
    registerTheme({
      link: styles.link,
    })
  );
};
