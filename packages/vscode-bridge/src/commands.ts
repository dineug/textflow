import { createCommand } from './bridge';

export const hostInitialCommand = createCommand('hostInitialCommand');
export const hostSaveValueCommand = createCommand<{
  value: string;
}>('hostSaveValueCommand');
export const hostReplicationChannelCommand = createCommand<string>(
  'hostReplicationChannelCommand'
);

export const webviewInitialValueCommand = createCommand<{
  value: string;
}>('webviewInitialValueCommand');
export const webviewUpdateBaseUrl = createCommand<{
  baseUrl: string;
}>('webviewUpdateBaseUrl');
export const webviewReplicationChannelCommand = createCommand<string>(
  'webviewReplicationChannelCommand'
);
