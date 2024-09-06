import { createExtension } from '@/extensions/extensionManager';

import MarkdownShortcutPlugin from './MarkdownShortcutPlugin';

export const extensionMarkdownShortcut = createExtension(
  () => {},
  MarkdownShortcutPlugin
);
