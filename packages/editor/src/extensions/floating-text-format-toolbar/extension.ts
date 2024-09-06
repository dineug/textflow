import { createExtension } from '@/extensions/extensionManager';

import FloatingTextFormatToolbarPlugin from './FloatingTextFormatToolbarPlugin';

export const extensionFloatingTextFormatToolbar = createExtension(
  () => {},
  FloatingTextFormatToolbarPlugin
);
