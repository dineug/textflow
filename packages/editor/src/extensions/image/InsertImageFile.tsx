import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { isString } from 'lodash-es';
import { useEffect } from 'react';

import { useExtensionManager } from '@/extensions/context';
import { createCommand } from '@/extensions/extensionManager';

import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

export const insertImageFileCommand = createCommand('insertImageFileCommand');

const InsertImageFile: React.FC = () => {
  const { registerCommand } = useExtensionManager();
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      registerCommand(insertImageFileCommand, () => {
        importImage(({ src, altText }) => {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText });
        });
      }),
    [editor, registerCommand]
  );

  return null;
};

InsertImageFile.displayName = 'InsertImageFile';

function importImage(
  change: (value: { src: string; altText: string }) => void
) {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const value = reader.result;
      if (!isString(value)) {
        return;
      }

      change({ src: value, altText: file.name });
    };
  });
  input.click();
}

export default InsertImageFile;
