import { assignInlineVars } from '@vanilla-extract/dynamic';
import { atom, useAtomValue } from 'jotai';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  RotateCcw,
  RotateCw,
  TextQuote,
} from 'lucide-react';
import { useLayoutEffect } from 'react';

import { useAppContext } from '@/components/app-context';
import * as editorComposerStyles from '@/components/editor-composer/EditorComposer.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import * as styles from './Toolbar.css';

export const enableToolbarAtom = atom(false);

const PADDING_TOP = 8;

const Toolbar: React.FC = () => {
  const enableToolbar = useAtomValue(enableToolbarAtom);
  const { $root } = useAppContext();

  useLayoutEffect(() => {
    if (!$root) return;

    const styleVars = assignInlineVars({
      [editorComposerStyles.paddingTopVar]: `${PADDING_TOP}px`,
    });

    if (enableToolbar) {
      Object.entries(styleVars).forEach(([cssVarName, value]) => {
        $root.style.setProperty(cssVarName, value);
      });
    } else {
      Object.keys(styleVars).forEach(cssVarName => {
        $root.style.removeProperty(cssVarName);
      });
    }

    return () => {
      Object.keys(styleVars).forEach(cssVarName => {
        $root.style.removeProperty(cssVarName);
      });
    };
  }, [$root, enableToolbar]);

  if (!enableToolbar) {
    return null;
  }

  return (
    <div className={styles.toolbarLayout}>
      <div className={cn(styles.toolbar, 'space-x-1 border-b')}>
        <Button variant="ghost" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>
        <div className="h-6 px-1">
          <Separator orientation="vertical" />
        </div>
        <Button variant="ghost" size="icon">
          <Pilcrow className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ListChecks className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <TextQuote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Code className="h-4 w-4" />
        </Button>
        <div className="h-6 px-1">
          <Separator orientation="vertical" />
        </div>
        <Button variant="ghost" size="icon">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

Toolbar.displayName = 'Toolbar';

export default Toolbar;
