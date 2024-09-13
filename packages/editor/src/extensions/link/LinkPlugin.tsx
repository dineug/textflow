import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { validateUrl } from '@/utils/url';

import AutoLinkPlugin from './AutoLinkPlugin';
import ClickableLinkPlugin from './ClickableLinkPlugin';
import FloatingLinkEditorPlugin from './FloatingLinkEditorPlugin';

const LinkPlugin: React.FC = () => {
  return (
    <>
      <LexicalLinkPlugin validateUrl={validateUrl} />
      <AutoLinkPlugin />
      <ClickableLinkPlugin />
      <FloatingLinkEditorPlugin />
    </>
  );
};

LinkPlugin.displayName = 'LinkPlugin';

export default LinkPlugin;
