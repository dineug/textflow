import { Sigma } from 'lucide-react';

import { createExtension } from '@/extensions/extensionManager';

import { EquationNode } from './EquationNode';
import EquationPlugin from './EquationPlugin';
import { showInsertKatexEquationDialogCommand } from './InsertKatexEquation';
import * as styles from './theme.css';

export const extensionEquation = createExtension(
  ({
    subscriptions,
    registerNode,
    registerTheme,
    registerSlashCommand,
    executeCommand,
  }) => {
    subscriptions
      .add(registerNode(EquationNode))
      .add(
        registerTheme({
          equation: styles.equation,
        })
      )
      .add(
        registerSlashCommand(({ registerCommands }) => {
          registerCommands(
            [
              {
                title: 'Equation',
                Icon: Sigma,
                keywords: ['equation', 'latex', 'math'],
                onSelect: () => {
                  executeCommand(
                    showInsertKatexEquationDialogCommand,
                    undefined
                  );
                },
              },
            ],
            1
          );
        })
      );
  },
  EquationPlugin
);
