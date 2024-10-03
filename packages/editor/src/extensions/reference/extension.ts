import { createExtension } from '@/extensions/extensionManager';

import { ReferenceNode } from './ReferenceNode';
import ReferencePlugin from './ReferencePlugin';
import * as styles from './theme.css';

export const extensionReference = createExtension(
  ({ subscriptions, registerNode, registerTheme }) => {
    subscriptions.add(registerNode(ReferenceNode)).add(
      registerTheme({
        reference: styles.reference,
      })
    );
  },
  ReferencePlugin
);
