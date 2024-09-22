import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { Observable } from 'lib0/observable';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as Y from 'yjs';

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;

const readMessage = (provider: BridgeProvider, buf: Uint8Array) => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);
  const awareness = provider.awareness;
  const doc = provider.doc;

  switch (messageType) {
    case messageSync: {
      encoding.writeVarUint(encoder, messageSync);
      const syncMessageType = syncProtocol.readSyncMessage(
        decoder,
        encoder,
        doc,
        provider
      );
      if (
        syncMessageType === syncProtocol.messageYjsSyncStep2 &&
        !provider.synced
      ) {
        provider.synced = true;
      }
      break;
    }
    case messageQueryAwareness:
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awareness.getStates().keys())
        )
      );
      break;
    case messageAwareness:
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        decoding.readVarUint8Array(decoder),
        provider
      );
      break;
  }

  return encoder;
};

const setupPort = (provider: BridgeProvider) => {
  if (provider.shouldConnect) {
    provider.connected = false;
    provider.synced = false;
    provider.emit('status', [{ status: 'connecting' }]);

    provider._port.onmessage = (event: any) => {
      const encoder = readMessage(provider, new Uint8Array(event.data));
      if (encoding.length(encoder) > 1) {
        provider._port.postMessage(encoding.toUint8Array(encoder));
      }
    };
    provider._port.start();

    provider.connected = true;
    provider.emit('status', [{ status: 'connected' }]);

    // write sync step 1
    const encoderSync = encoding.createEncoder();
    encoding.writeVarUint(encoderSync, messageSync);
    syncProtocol.writeSyncStep1(encoderSync, provider.doc);
    provider._port.postMessage(encoding.toUint8Array(encoderSync));
    // broadcast local state
    // const encoderState = encoding.createEncoder();
    // encoding.writeVarUint(encoderState, messageSync);
    // syncProtocol.writeSyncStep2(encoderState, provider.doc);
    // provider._port.postMessage(encoding.toUint8Array(encoderState));
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
    provider._port.postMessage(encoding.toUint8Array(encoderAwarenessQuery));
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessState, messageAwareness);
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [
        provider.doc.clientID,
      ])
    );
    provider._port.postMessage(encoding.toUint8Array(encoderAwarenessState));
  }
};

const broadcastMessage = (provider: BridgeProvider, buf: Uint8Array) => {
  provider._port.postMessage(buf);
};

export class BridgeProvider extends Observable<string> {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;

  connected = false;
  _synced = false;
  shouldConnect = false;

  _port: any;

  get synced() {
    return this._synced;
  }

  set synced(state) {
    if (this._synced !== state) {
      this._synced = state;
      this.emit('synced', [state]);
      this.emit('sync', [state]);
    }
  }

  _updateHandler = (update: Uint8Array, origin: any) => {
    if (origin !== this) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      broadcastMessage(this, encoding.toUint8Array(encoder));
    }
  };

  _awarenessUpdateHandler = (
    { added, updated, removed }: any,
    _origin: any
  ) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
    );
    broadcastMessage(this, encoding.toUint8Array(encoder));
  };

  constructor(doc: Y.Doc, port: any) {
    super();

    this.doc = doc;
    this.awareness = new awarenessProtocol.Awareness(doc);
    this._port = port;

    this.doc.on('update', this._updateHandler);
    this.awareness.on('update', this._awarenessUpdateHandler);
  }

  destroy() {
    this.disconnect();
    this.awareness.off('update', this._awarenessUpdateHandler);
    this.doc.off('update', this._updateHandler);
    super.destroy();
  }

  disconnect() {
    this.shouldConnect = false;
  }

  connect() {
    this.shouldConnect = true;
    if (!this.connected) {
      setupPort(this);
    }
  }
}
