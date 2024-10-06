import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { GripVertical } from 'lucide-react';
import { useRef } from 'react';

import { useAppContext } from '@/components/app-context';

import * as styles from './DraggableBlockPlugin.css';

const DraggableBlockPlugin: React.FC = () => {
  const { $editor } = useAppContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const isEditable = useLexicalEditable();

  const handleIsOnMenu = (element: HTMLElement) => {
    return Boolean(element.closest(`.${styles.menu}`));
  };

  if (!$editor || !isEditable) {
    return null;
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={$editor}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div ref={menuRef} className={styles.menu}>
          <GripVertical className="h-4 w-4" />
        </div>
      }
      targetLineComponent={
        <div ref={targetLineRef} className={styles.targetLine} />
      }
      isOnMenu={handleIsOnMenu}
    />
  );
};

DraggableBlockPlugin.displayName = 'DraggableBlockPlugin';

export default DraggableBlockPlugin;
