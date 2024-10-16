import { useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';

import { enableToolbarAtom } from './Toolbar';

const ToolbarPlugin: React.FC = () => {
  const setEnableToolbar = useSetAtom(enableToolbarAtom);

  useLayoutEffect(() => {
    setEnableToolbar(true);

    return () => {
      setEnableToolbar(false);
    };
  }, [setEnableToolbar]);

  return null;
};

ToolbarPlugin.displayName = 'extensionToolbar.Plugin';

export default ToolbarPlugin;
