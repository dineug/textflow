import {
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { Link } from 'lucide-react';

import { createExtension } from '@/extensions/extensionManager';
import { getSelectedNode } from '@/utils/getSelectedNode';

import { linkEditModeCommand } from './FloatingLinkEditorPlugin';
import LinkPlugin from './LinkPlugin';
import * as styles from './theme.css';

export const extensionLink = createExtension(
  ({
    subscriptions,
    registerNode,
    registerTheme,
    registerFloatingTextFormatButton,
    executeCommand,
  }) => {
    subscriptions
      .add(registerNode(AutoLinkNode, LinkNode))
      .add(
        registerTheme({
          link: styles.link,
        })
      )
      .add(
        registerFloatingTextFormatButton({
          Icon: Link,
          $hasFormat: selection => {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            return $isLinkNode(parent) || $isLinkNode(node);
          },
          onClick: (editor, isFormat) => {
            executeCommand(linkEditModeCommand, !isFormat);
            editor.dispatchCommand(
              TOGGLE_LINK_COMMAND,
              isFormat ? null : 'https://'
            );
          },
        })
      );
  },
  LinkPlugin
);
