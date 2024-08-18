import { registerExtensionCode } from './code/extension';
import { registerExtensionDraggableBlock } from './draggable-block/extension';
import type { RegisterExtension } from './extensionManager';
import { registerExtensionHorizontalRule } from './horizontal-rule/extension';
import { registerExtensionLink } from './link/extension';
import { registerExtensionList } from './list/extension';
import { registerExtensionRichText } from './rich-text/extension';
import { registerExtensionSlashCommand } from './slash-command/extension';

export const extensions: RegisterExtension[] = [
  registerExtensionRichText,
  registerExtensionLink,
  registerExtensionList,
  registerExtensionCode,
  registerExtensionHorizontalRule,
  registerExtensionSlashCommand,
  registerExtensionDraggableBlock,
];
