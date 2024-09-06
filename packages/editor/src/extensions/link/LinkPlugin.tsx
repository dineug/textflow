import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { validateUrl } from '@/utils/url';

const LinkPlugin: React.FC = () => {
  return (
    <>
      <LexicalLinkPlugin validateUrl={validateUrl} />
    </>
  );
};

LinkPlugin.displayName = 'LinkPlugin';

export default LinkPlugin;
