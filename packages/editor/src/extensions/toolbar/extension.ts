import { createExtension } from '@/extensions/extensionManager';

import ToolbarPlugin from './ToolbarPlugin';

export const extensionToolbar = createExtension(() => {}, ToolbarPlugin);
