import 'katex/dist/katex.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';

import { $createEquationNode, EquationNode } from './EquationNode';
import InsertKatexEquation from './InsertKatexEquation';

type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand('INSERT_EQUATION_COMMAND');

const EquationPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([EquationNode])) {
      throw new Error('EquationPlugin: EquationsNode not registered on editor');
    }

    return editor.registerCommand<CommandPayload>(
      INSERT_EQUATION_COMMAND,
      ({ equation, inline }) => {
        const equationNode = $createEquationNode(equation, inline);

        $insertNodes([equationNode]);
        if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
          $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return <InsertKatexEquation />;
};

EquationPlugin.displayName = 'extensionEquation.Plugin';

export default EquationPlugin;
