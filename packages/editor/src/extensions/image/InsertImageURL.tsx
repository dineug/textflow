import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { useExtensionManager } from '@/extensions/context';
import { createCommand } from '@/extensions/extensionManager';

import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

export const showInsertImageURLDialogCommand = createCommand(
  'showInsertImageURLDialogCommand'
);

// TODO: Autocomplete absolutePath
const InsertImageURL: React.FC = () => {
  const { registerCommand } = useExtensionManager();
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);
  const [src, setSrc] = useState('');
  const [altText, setAltText] = useState('');
  const isDisabled = !src.trim();
  const [htmlForSrc] = useState(nanoid);
  const [htmlForAlt] = useState(nanoid);

  const handleInsertImage = () => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText });
    setShow(false);
  };

  useEffect(
    () =>
      registerCommand(showInsertImageURLDialogCommand, () => {
        setSrc('');
        setAltText('');
        setShow(true);
      }),
    [registerCommand]
  );

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-6 items-center gap-4">
            <Label htmlFor={htmlForSrc} className="text-right">
              Image URL
            </Label>
            <Input
              id={htmlForSrc}
              value={src}
              placeholder="i.e. https://..."
              className="col-span-5"
              onChange={event => {
                setSrc(event.target.value);
              }}
            />
          </div>
          <div className="grid grid-cols-6 items-center gap-4">
            <Label htmlFor={htmlForAlt} className="text-right">
              Alt Text
            </Label>
            <Input
              id={htmlForAlt}
              value={altText}
              placeholder="alternative text"
              className="col-span-5"
              onChange={event => {
                setAltText(event.target.value);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isDisabled} onClick={handleInsertImage}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

InsertImageURL.displayName = 'InsertImageURL';

export default InsertImageURL;
