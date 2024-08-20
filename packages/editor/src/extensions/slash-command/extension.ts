import type { RegisterExtension } from '@/extensions/extensionManager';

import SlashCommandPlugin from './SlashCommandPlugin';

export const registerExtensionSlashCommand: RegisterExtension = ({
  subscriptions,
  registerPlugin,
}) => {
  subscriptions.add(registerPlugin(SlashCommandPlugin));
};
