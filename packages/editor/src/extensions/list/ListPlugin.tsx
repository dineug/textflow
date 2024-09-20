import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ListPlugin as LexicalListPlugin } from '@lexical/react/LexicalListPlugin';

import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin';

const ListPlugin: React.FC = () => (
  <>
    <LexicalListPlugin />
    <CheckListPlugin />
    <ListMaxIndentLevelPlugin maxDepth={7} />
  </>
);

ListPlugin.displayName = 'extensionList.Plugin';

export default ListPlugin;
