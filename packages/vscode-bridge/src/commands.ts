import { createCommand } from './bridge';
import { Theme } from './theme';

export const hostInitialCommand = createCommand('hostInitialCommand');
export const hostSaveValueCommand = createCommand<{
  value: string;
}>('hostSaveValueCommand');
export const hostSaveThemeCommand = createCommand<Theme>(
  'hostSaveThemeCommand'
);
export const hostUpdateReferenceListCommand = createCommand<
  Array<{
    title: string;
    path: string;
  }>
>('hostUpdateReferenceListCommand');
export const hostOpenReferenceCommand = createCommand<{
  title: string;
  relativePath: string;
}>('hostOpenReferenceCommand');

export const webviewInitialValueCommand = createCommand<{
  value: string;
}>('webviewInitialValueCommand');
export const webviewUpdateBaseUrlCommand = createCommand<{
  baseUrl: string;
  path: string;
}>('webviewUpdateBaseUrlCommand');
export const webviewUpdateThemeCommand = createCommand<Partial<Theme>>(
  'webviewUpdateThemeCommand'
);
export const webviewUpdateReferenceListCommand = createCommand<
  Array<{
    title: string;
    path: string;
    relativePath: string;
  }>
>('webviewUpdateReferenceListCommand');

export const workerFindReferenceListCommand = createCommand<Array<string>>(
  'workerFindReferenceListCommand'
);
