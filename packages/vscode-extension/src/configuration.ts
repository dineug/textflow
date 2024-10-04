import {
  AccentColor,
  Appearance,
  GrayColor,
  Theme,
} from '@dineug/textflow-editor-vscode-bridge';
import * as vscode from 'vscode';

function getConfigurationScope(
  config: vscode.WorkspaceConfiguration,
  key: string
) {
  const inspect = config.inspect(key);
  if (inspect?.workspaceFolderValue) {
    return vscode.ConfigurationTarget.WorkspaceFolder;
  }
  if (inspect?.workspaceValue) {
    return vscode.ConfigurationTarget.Workspace;
  }
  return vscode.ConfigurationTarget.Global;
}

export function saveTheme(theme: Theme) {
  const config = vscode.workspace.getConfiguration(
    'dineug.textflow-editor.theme'
  );

  config.update(
    'appearance',
    theme.appearance,
    getConfigurationScope(config, 'appearance')
  );
  config.update(
    'grayColor',
    theme.grayColor,
    getConfigurationScope(config, 'grayColor')
  );
  config.update(
    'accentColor',
    theme.accentColor,
    getConfigurationScope(config, 'accentColor')
  );
}

export function getTheme(): Theme {
  const config = vscode.workspace.getConfiguration(
    'dineug.textflow-editor.theme'
  );

  return {
    appearance: config.get('appearance', Appearance.dark),
    grayColor: config.get('grayColor', GrayColor.slate),
    accentColor: config.get('accentColor', AccentColor.indigo),
  };
}
