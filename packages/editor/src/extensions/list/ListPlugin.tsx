import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ListPlugin as LexicalListPlugin } from '@lexical/react/LexicalListPlugin';

const ListPlugin: React.FC = () => {
  // ListMaxIndentLevelPlugin

  return (
    <>
      <LexicalListPlugin />
      <CheckListPlugin />
    </>
  );
};

ListPlugin.displayName = 'ListPlugin';

export default ListPlugin;
