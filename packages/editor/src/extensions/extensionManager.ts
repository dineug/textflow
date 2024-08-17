import type { EditorThemeClasses, Klass, LexicalNode } from 'lexical';
import { createElement, Fragment } from 'react';

export type Dispose = () => void;

export type ExtensionContext = {
  registerNode: (...nodes: Array<Klass<LexicalNode>>) => Dispose;
  registerTheme: (theme: EditorThemeClasses) => Dispose;
  registerPlugin: (plugin: React.FC) => Dispose;
  subscriptions: Set<Dispose>;
};

export type RegisterExtension = (context: ExtensionContext) => Dispose | void;

export type ConfigureExtensionOptions = {
  extensions: RegisterExtension[];
};

class ExtensionManager {
  #disposeSet = new Set<Dispose>();
  #nodes = new Set<Klass<LexicalNode>>();
  #themes = new Set<EditorThemeClasses>();
  #plugins = new Set<React.FC>();

  getNodes(): IterableIterator<Klass<LexicalNode>> {
    return this.#nodes.values();
  }

  getTheme(): EditorThemeClasses {
    return [...this.#themes].reduce(
      (prev: EditorThemeClasses, cur) => ({ ...prev, ...cur }),
      {}
    );
  }

  Plugins = (): React.ReactNode => {
    return createElement(
      Fragment,
      null,
      [...this.#plugins].map(Plugin =>
        createElement(Plugin, { key: `${Plugin.displayName}` })
      )
    );
  };

  registerNode(...nodes: Array<Klass<LexicalNode>>): Dispose {
    nodes.forEach(node => this.#nodes.add(node));
    return () => {
      nodes.forEach(node => this.#nodes.delete(node));
    };
  }

  registerTheme(theme: EditorThemeClasses): Dispose {
    this.#themes.add(theme);
    return () => {
      this.#themes.delete(theme);
    };
  }

  registerPlugin(plugin: React.FC): Dispose {
    this.#plugins.add(plugin);
    return () => {
      this.#plugins.delete(plugin);
    };
  }

  registerDispose(dispose: Dispose): Dispose {
    this.#disposeSet.add(dispose);
    return () => {
      this.#disposeSet.delete(dispose);
    };
  }

  dispose() {
    this.#disposeSet.forEach(dispose => dispose());
    this.#disposeSet.clear();
    this.#nodes.clear();
    this.#themes.clear();
  }
}

export function createExtensionContext(
  manager: ExtensionManager
): ExtensionContext {
  const subscriptions = new Set<Dispose>();

  const registerNode = (...nodes: Array<Klass<LexicalNode>>) => {
    return manager.registerNode(...nodes);
  };

  const registerTheme = (theme: EditorThemeClasses) => {
    return manager.registerTheme(theme);
  };

  const registerPlugin = (plugin: React.FC) => {
    return manager.registerPlugin(plugin);
  };

  return {
    registerNode,
    registerTheme,
    registerPlugin,
    subscriptions,
  };
}

export function configureExtensions(
  config: ConfigureExtensionOptions
): ExtensionManager {
  const manager = new ExtensionManager();
  const contextSet = new Set<ExtensionContext>();
  const subscriptions = new Set<Dispose | void>();

  config.extensions.forEach(registerExtension => {
    const context = createExtensionContext(manager);
    subscriptions.add(registerExtension(context));
    contextSet.add(context);
  });

  manager.registerDispose(() => {
    contextSet.forEach(context => {
      context.subscriptions.forEach(subscription => subscription());
      context.subscriptions.clear();
    });
    contextSet.clear();
    subscriptions.forEach(subscription => subscription?.());
    subscriptions.clear();
  });

  return manager;
}
