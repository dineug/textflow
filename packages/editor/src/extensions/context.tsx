import { createContext, useContext } from 'react';

import { ExtensionManager } from './extensionManager';

const ExtensionManagerContext = createContext<ExtensionManager | null>(null);

export const ExtensionManagerProvider: React.FC<
  React.PropsWithChildren<{ value: ExtensionManager }>
> = props => <ExtensionManagerContext.Provider {...props} />;

ExtensionManagerProvider.displayName = 'ExtensionManagerProvider';

export function useExtensionManager(): ExtensionManager {
  const context = useContext(ExtensionManagerContext);

  if (context === null) {
    throw new Error(
      'useExtensionManager must be used within a ExtensionManagerProvider'
    );
  }

  return context;
}
