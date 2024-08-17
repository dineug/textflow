import { createContext, useContext } from 'react';

import { ExtensionManager } from './extensionManager';

const _ExtensionManagerContext = createContext<ExtensionManager>(
  new ExtensionManager()
);

export const ExtensionManagerContext = _ExtensionManagerContext.Provider;

export function useExtensionManagerContext() {
  return useContext(_ExtensionManagerContext);
}
