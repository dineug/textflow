import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import clsx from 'clsx';
import type { NodeKey } from 'lexical';
import { FileSymlink } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useExtensionManager } from '@/extensions/context';
import { createCommand } from '@/extensions/extensionManager';
import { cn } from '@/lib/utils';

import * as styles from './ReferenceComponent.css';

export const openReferenceCommand = createCommand<{
  title: string;
  relativePath: string;
}>('openReferenceCommand');

type ReferenceComponentProps = {
  title: string;
  relativePath: string;
  nodeKey: NodeKey;
};

const ReferenceComponent: React.FC<ReferenceComponentProps> = ({
  title,
  relativePath,
  nodeKey,
}) => {
  const [isSelected] = useLexicalNodeSelection(nodeKey);
  const { executeCommand } = useExtensionManager();

  const handleClick = () => {
    executeCommand(openReferenceCommand, { title, relativePath });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={clsx([
            styles.reference,
            {
              [styles.focused]: isSelected,
            },
          ])}
          onClick={handleClick}
        >
          <FileSymlink className={cn('mb-0.5 mr-1 inline h-4 w-4')} />
          <span>{title}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{relativePath}</TooltipContent>
    </Tooltip>
  );
};

ReferenceComponent.displayName = 'ReferenceComponent';

export default ReferenceComponent;
