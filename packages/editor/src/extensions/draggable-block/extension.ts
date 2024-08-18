import type { RegisterExtension } from '@/extensions/extensionManager';

import DraggableBlockPlugin from './DraggableBlockPlugin';

export const registerExtensionDraggableBlock: RegisterExtension = context => {
  context.subscriptions.add(context.registerPlugin(DraggableBlockPlugin));
};
