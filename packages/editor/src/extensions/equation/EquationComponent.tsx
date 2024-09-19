// https://github.com/facebook/lexical/tree/main/packages/lexical-playground

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import * as styles from './EquationComponent.css';
import EquationEditor from './EquationEditor';
import { $isEquationNode } from './EquationNode';
import KatexRenderer from './KatexRenderer';

type EquationComponentProps = {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
};

const EquationComponent: React.FC<EquationComponentProps> = ({
  equation,
  inline,
  nodeKey,
}) => {
  const [editor] = useLexicalComposerContext();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const inputRef = useRef(null);
  const ghostRef = useRef<HTMLSpanElement>(null);

  const [isSelected] = useLexicalNodeSelection(nodeKey);
  const isFocused = isSelected;

  useEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;

    const parent = ghost.parentElement;
    if (!parent) return;

    if (isFocused) {
      parent.classList.add(styles.focused);
    } else {
      parent.classList.remove(styles.focused);
    }
  }, [isFocused]);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey]
  );

  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);

  useEffect(() => {
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          () => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem === activeElement) {
              onHide(true);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        )
      );
    } else {
      return editor.registerUpdateListener(({ editorState }) => {
        const isSelected = editorState.read(() => {
          const selection = $getSelection();
          return (
            $isNodeSelection(selection) &&
            selection.has(nodeKey) &&
            selection.getNodes().length === 1
          );
        });
        if (isSelected) {
          setShowEquationEditor(true);
        }
      });
    }
  }, [editor, nodeKey, onHide, showEquationEditor]);

  return (
    <>
      {showEquationEditor ? (
        <EquationEditor
          equation={equationValue}
          setEquation={setEquationValue}
          inline={inline}
          ref={inputRef}
        />
      ) : (
        <ErrorBoundary onError={e => editor._onError(e)} fallback={null}>
          <KatexRenderer
            equation={equationValue}
            inline={inline}
            onDoubleClick={() => setShowEquationEditor(true)}
          />
        </ErrorBoundary>
      )}
      <span className={styles.ghost} ref={ghostRef} />
    </>
  );
};

EquationComponent.displayName = 'EquationComponent';

export default EquationComponent;
