import { createContext, useContext } from 'react';

type AppContextState = {
  root: HTMLDivElement | null;
  editor: HTMLDivElement | null;
};

const _AppContext = createContext<AppContextState>({
  root: null,
  editor: null,
});

export const AppContext = _AppContext.Provider;

export function useAppContext() {
  return useContext(_AppContext);
}
