import { BridgeProvider } from '@dineug/y-bridge';
import { Provider } from '@lexical/yjs';
import { Doc } from 'yjs';

const channel = new MessageChannel();
export const replicationPort = channel.port1;

// parent dom -> child doc
export function createBridgeProvider(
  id: string,
  yjsDocMap: Map<string, Doc>
): Provider {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  // @ts-expect-error
  return new BridgeProvider(doc, channel.port2);
}
