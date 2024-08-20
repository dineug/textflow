import { registerExtensionCode } from './code/extension';
import type { RegisterExtension } from './extensionManager';
import { registerExtensionHorizontalRule } from './horizontal-rule/extension';
import { registerExtensionLink } from './link/extension';
import { registerExtensionList } from './list/extension';
import { registerExtensionMarkdownShortcut } from './markdown-shortcut/extension';
import { registerExtensionRichText } from './rich-text/extension';
import { registerExtensionSlashCommand } from './slash-command/extension';

export const extensions: RegisterExtension[] = [
  registerExtensionRichText,
  registerExtensionLink,
  registerExtensionList,
  registerExtensionCode,
  registerExtensionHorizontalRule,
  registerExtensionSlashCommand,
  registerExtensionMarkdownShortcut,
];
