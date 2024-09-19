import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExtensionManager } from '@/extensions/context';
import { createCommand } from '@/extensions/extensionManager';
import { cn } from '@/lib/utils';

import { INSERT_EQUATION_COMMAND } from './EquationPlugin';
import KatexRenderer from './KatexRenderer';

export const showInsertKatexEquationDialogCommand = createCommand(
  'showInsertKatexEquationDialogCommand'
);

const InsertKatexEquation: React.FC = () => {
  const { registerCommand } = useExtensionManager();
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);
  const [equation, setEquation] = useState('');
  const [inline, setInline] = useState(true);
  const isDisabled = !equation.trim();
  const [htmlForEquation] = useState(nanoid);
  const [htmlForInline] = useState(nanoid);

  const handleInsertKatexEquation = () => {
    editor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline });
    setShow(false);
  };

  useEffect(
    () =>
      registerCommand(showInsertKatexEquationDialogCommand, () => {
        setEquation('');
        setInline(true);
        setShow(true);
      }),
    [registerCommand]
  );

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Equation</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor={htmlForEquation}>Equation</Label>
            {inline ? (
              <Input
                id={htmlForEquation}
                value={equation}
                onChange={event => {
                  setEquation(event.target.value);
                }}
              />
            ) : (
              <Textarea
                id={htmlForEquation}
                value={equation}
                onChange={event => {
                  setEquation(event.target.value);
                }}
              />
            )}
          </div>
          <div className="grid gap-3">
            <Label>Visualization</Label>
            <ErrorBoundary onError={e => editor._onError(e)} fallback={null}>
              <KatexRenderer
                equation={equation}
                inline={false}
                onDoubleClick={() => null}
              />
            </ErrorBoundary>
          </div>
        </div>
        <DialogFooter>
          <div className={cn('mr-auto flex items-center space-x-2')}>
            <Checkbox
              id={htmlForInline}
              checked={inline}
              onCheckedChange={checked => {
                setInline(checked === 'indeterminate' ? false : checked);
              }}
            />
            <Label
              htmlFor={htmlForInline}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              )}
            >
              Inline
            </Label>
          </div>
          <Button disabled={isDisabled} onClick={handleInsertKatexEquation}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

InsertKatexEquation.displayName = 'InsertKatexEquation';

export default InsertKatexEquation;
