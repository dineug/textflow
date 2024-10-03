import './index.css';

export { default as Editor } from './Editor';
export { replicationPort } from './replicationBridge';
export type { Theme } from '@/components/theme';
export { openReferenceCommand } from '@/extensions/reference/ReferenceComponent';
export { setReferenceListCommand } from '@/extensions/reference/ReferencePlugin';
export type {
  AccentColor,
  Appearance,
  GrayColor,
} from '@/themes/radix-ui-theme';
