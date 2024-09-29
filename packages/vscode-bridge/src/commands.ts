import { createCommand } from './bridge';
import { Theme } from './theme';

export const hostInitialCommand = createCommand('hostInitialCommand');
export const hostSaveValueCommand = createCommand<{
  value: string;
}>('hostSaveValueCommand');
export const hostReplicationChannelCommand = createCommand<string>(
  'hostReplicationChannelCommand'
);
export const hostSaveThemeCommand = createCommand<Theme>(
  'hostSaveThemeCommand'
);

export const webviewInitialValueCommand = createCommand<{
  value: string;
}>('webviewInitialValueCommand');
export const webviewUpdateBaseUrlCommand = createCommand<{
  baseUrl: string;
}>('webviewUpdateBaseUrlCommand');
export const webviewReplicationChannelCommand = createCommand<string>(
  'webviewReplicationChannelCommand'
);
export const webviewUpdateThemeCommand = createCommand<Partial<Theme>>(
  'webviewUpdateThemeCommand'
);
