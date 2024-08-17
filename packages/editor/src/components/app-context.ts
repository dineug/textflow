import { createContext, createRef, useContext } from 'react';

type AppContextState = {
  root: React.RefObject<HTMLDivElement>;
};

const _AppContext = createContext<AppContextState>({
  root: createRef(),
});

export const AppContext = _AppContext.Provider;

export function useAppContext() {
  return useContext(_AppContext);
}
