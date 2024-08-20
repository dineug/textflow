import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';

import DraggableBlockPlugin from './DraggableBlockPlugin';

const RichTextPlugin: React.FC = () => (
  <>
    <TabIndentationPlugin />
    <DraggableBlockPlugin />
  </>
);

RichTextPlugin.displayName = 'RichTextPlugin';

export default RichTextPlugin;
