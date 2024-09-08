import { createExtension } from '@/extensions/extensionManager';

import EmojiPlugin from './EmojiPlugin';

export const extensionEmoji = createExtension(() => {}, EmojiPlugin);
