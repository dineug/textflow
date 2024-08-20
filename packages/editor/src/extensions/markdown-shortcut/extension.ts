import { CHECK_LIST } from '@lexical/markdown';

import type { RegisterExtension } from '@/extensions/extensionManager';

import MarkdownShortcutPlugin from './MarkdownShortcutPlugin';

export const registerExtensionMarkdownShortcut: RegisterExtension = ({
  subscriptions,
  registerTransformer,
  registerPlugin,
}) => {
  subscriptions
    .add(registerTransformer(CHECK_LIST))
    .add(registerPlugin(MarkdownShortcutPlugin));
};
