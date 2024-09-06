import { createExtension } from '@/extensions/extensionManager';

import SlashCommandPlugin from './SlashCommandPlugin';

export const extensionSlashCommand = createExtension(
  () => {},
  SlashCommandPlugin
);
