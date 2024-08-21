import type { RegisterExtension } from '@/extensions/extensionManager';

import FloatingTextFormatToolbarPlugin from './FloatingTextFormatToolbarPlugin';

export const registerExtensionFloatingTextFormatToolbar: RegisterExtension = ({
  subscriptions,
  registerPlugin,
}) => {
  subscriptions.add(registerPlugin(FloatingTextFormatToolbarPlugin));
};
