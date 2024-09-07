import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from '@lexical/react/LexicalAutoLinkPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';

import { validateUrl } from '@/utils/url';

import FloatingLinkEditorPlugin from './FloatingLinkEditorPlugin';

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, text => {
    return text.startsWith('http') ? text : `https://${text}`;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, text => {
    return `mailto:${text}`;
  }),
];

const LinkPlugin: React.FC = () => {
  const isEditable = useLexicalEditable();

  return (
    <>
      <LexicalLinkPlugin validateUrl={validateUrl} />
      <AutoLinkPlugin matchers={MATCHERS} />
      <ClickableLinkPlugin disabled={isEditable} />
      <FloatingLinkEditorPlugin />
    </>
  );
};

LinkPlugin.displayName = 'LinkPlugin';

export default LinkPlugin;
