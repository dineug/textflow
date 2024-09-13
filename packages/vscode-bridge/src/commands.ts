import { createCommand } from './bridge';

export const hostInitialCommand = createCommand('hostInitialCommand');
export const hostSaveValueCommand = createCommand<{
  value: string;
}>('hostSaveValueCommand');

export const webviewInitialValueCommand = createCommand<{
  value: string;
}>('webviewInitialValueCommand');