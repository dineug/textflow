import {
  createEmptyHistoryState,
  type HistoryState,
  registerHistory,
} from '@lexical/history';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { useEffect, useMemo } from 'react';

type LimitedHistoryPluginProps = {
  delay?: number;
  maxHistory?: number;
  externalHistoryState?: HistoryState;
};

const LimitedHistoryPlugin: React.FC<LimitedHistoryPluginProps> = ({
  delay = 1000,
  maxHistory = 100,
  externalHistoryState,
}) => {
  const [editor] = useLexicalComposerContext();
  const historyState = useMemo(
    () => externalHistoryState ?? createEmptyHistoryState(),
    [externalHistoryState]
  );

  useEffect(() => {
    return mergeRegister(
      registerHistory(editor, historyState, delay),
      editor.registerUpdateListener(() => {
        const redoLength = historyState.redoStack.length;
        const undoLength = historyState.undoStack.length;

        if (maxHistory < redoLength) {
          historyState.redoStack.splice(0, redoLength - maxHistory);
        }

        if (maxHistory < undoLength) {
          historyState.undoStack.splice(0, undoLength - maxHistory);
        }
      })
    );
  }, [delay, editor, historyState, maxHistory]);

  return null;
};

LimitedHistoryPlugin.displayName = 'LimitedHistoryPlugin';

export default LimitedHistoryPlugin;
