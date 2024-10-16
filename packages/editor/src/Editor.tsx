import type { EditorState } from 'lexical';
import { forwardRef, useCallback, useEffect, useMemo } from 'react';

import EditorComposer from '@/components/editor-composer/EditorComposer';
import { extensionCode } from '@/extensions/code/extension';
import { extensionCollapsible } from '@/extensions/collapsible/extension';
import { ExtensionManagerProvider } from '@/extensions/context';
import { extensionEmoji } from '@/extensions/emoji/extension';
import { extensionEquation } from '@/extensions/equation/extension';
import { configureExtensions } from '@/extensions/extensionManager';
import { extensionFloatingTextFormatToolbar } from '@/extensions/floating-text-format-toolbar/extension';
import { extensionHorizontalRule } from '@/extensions/horizontal-rule/extension';
import { extensionImage } from '@/extensions/image/extension';
import { extensionLink } from '@/extensions/link/extension';
import { extensionList } from '@/extensions/list/extension';
import { extensionMarkdownShortcut } from '@/extensions/markdown-shortcut/extension';
import { extensionReference } from '@/extensions/reference/extension';
import { extensionRichText } from '@/extensions/rich-text/extension';
import { extensionSlashCommand } from '@/extensions/slash-command/extension';
import { extensionTable } from '@/extensions/table/extension';
import { extensionToolbar } from '@/extensions/toolbar/extension';

type EditorProps = Omit<
  React.ComponentProps<typeof EditorComposer>,
  'initialValue' | 'onChange' | 'children'
> & {
  initialValue?: string;
  onChange?: (value: string) => void;
};

const Editor = forwardRef<
  React.ComponentRef<typeof EditorComposer>,
  EditorProps
>(({ initialValue, onChange, ...props }, ref) => {
  const extensionManager = useMemo(
    () =>
      configureExtensions({
        extensions: [
          extensionReference,
          extensionRichText,
          extensionLink,
          extensionList,
          extensionCode,
          extensionHorizontalRule,
          extensionSlashCommand,
          extensionMarkdownShortcut,
          extensionFloatingTextFormatToolbar,
          extensionEmoji,
          extensionImage,
          extensionEquation,
          extensionTable,
          extensionCollapsible,
          extensionToolbar,
        ],
      }),
    []
  );
  useEffect(() => extensionManager.dispose, [extensionManager.dispose]);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      onChange?.(JSON.stringify(editorState.toJSON(), null, 2));
    },
    [onChange]
  );

  return (
    <ExtensionManagerProvider value={extensionManager}>
      <EditorComposer
        {...props}
        ref={ref}
        initialValue={initialValue}
        onChange={handleChange}
      >
        <extensionReference.Plugin />
        <extensionRichText.Plugin />
        <extensionLink.Plugin />
        <extensionList.Plugin />
        <extensionCode.Plugin />
        <extensionHorizontalRule.Plugin />
        <extensionSlashCommand.Plugin />
        <extensionMarkdownShortcut.Plugin />
        <extensionFloatingTextFormatToolbar.Plugin />
        <extensionEmoji.Plugin />
        <extensionImage.Plugin />
        <extensionEquation.Plugin />
        <extensionTable.Plugin />
        <extensionCollapsible.Plugin />
        <extensionToolbar.Plugin />
      </EditorComposer>
    </ExtensionManagerProvider>
  );
});

Editor.displayName = 'Editor';

export default Editor;
