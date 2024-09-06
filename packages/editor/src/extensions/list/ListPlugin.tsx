import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ListPlugin as LexicalListPlugin } from '@lexical/react/LexicalListPlugin';

import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin';

const ListPlugin: React.FC = () => {
  return (
    <>
      <LexicalListPlugin />
      <CheckListPlugin />
      <ListMaxIndentLevelPlugin maxDepth={7} />
    </>
  );
};

ListPlugin.displayName = 'ListPlugin';

export default ListPlugin;
