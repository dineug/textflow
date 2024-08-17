import type { RegisterExtension } from '@/extensions/extensionManager';

import SlashCommandPlugin from './SlashCommandPlugin';

export const registerExtensionSlashCommand: RegisterExtension = context => {
  context.subscriptions.add(context.registerPlugin(SlashCommandPlugin));
};
