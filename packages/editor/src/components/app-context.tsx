import { createContext, useContext } from 'react';

type AppContextState = {
  $root: HTMLDivElement | null;
  $editor: HTMLDivElement | null;
};

const AppContext = createContext<AppContextState | null>(null);

export const AppProvider: React.FC<
  React.PropsWithChildren<{ value: AppContextState }>
> = props => <AppContext.Provider {...props} />;

AppProvider.displayName = 'AppProvider';

export function useAppContext(): AppContextState {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error('useAppContext must be used within a AppProvider');
  }

  return context;
}