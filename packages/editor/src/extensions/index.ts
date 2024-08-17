import { registerExtensionCode } from './code/extension';
import type { RegisterExtension } from './extensionManager';
import { registerExtensionHorizontalRule } from './horizontalRule/extension';
import { registerExtensionLink } from './link/extension';
import { registerExtensionRichText } from './rich-text/extension';

export const extensions: RegisterExtension[] = [
  registerExtensionRichText,
  registerExtensionLink,
  registerExtensionCode,
  registerExtensionHorizontalRule,
];
