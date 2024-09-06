import { CHECK_LIST } from '@lexical/markdown';
import {
  DEFAULT_TRANSFORMERS,
  MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin,
} from '@lexical/react/LexicalMarkdownShortcutPlugin';

const transformers = [CHECK_LIST, ...DEFAULT_TRANSFORMERS];

const MarkdownShortcutPlugin: React.FC = () => {
  return <LexicalMarkdownShortcutPlugin transformers={transformers} />;
};

MarkdownShortcutPlugin.displayName = 'MarkdownShortcutPlugin';

export default MarkdownShortcutPlugin;
