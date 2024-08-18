import type {
  EditorThemeClasses,
  Klass,
  LexicalEditor,
  LexicalNode,
} from 'lexical';
import { createElement, Fragment } from 'react';

import {
  type DynamicSlashCommand,
  type SlashCommand,
  type SlashCommandContext,
  SlashCommandMenu,
} from './slash-command';

export type Dispose = () => void;

export type ExtensionContext = {
  registerNode: (...nodes: Array<Klass<LexicalNode>>) => Dispose;
  registerTheme: (theme: EditorThemeClasses) => Dispose;
  registerPlugin: (plugin: React.FC) => Dispose;
  registerSlashCommand: (
    render: (context: SlashCommandContext) => void
  ) => Dispose;
  subscriptions: Set<Dispose>;
};

export type RegisterExtension = (context: ExtensionContext) => Dispose | void;

export type ConfigureExtensionOptions = {
  extensions: RegisterExtension[];
};

export class ExtensionManager {
  #disposeSet = new Set<Dispose>();
  #nodes = new Set<Klass<LexicalNode>>();
  #themes = new Set<EditorThemeClasses>();
  #plugins = new Set<React.FC>();
  #slashCommands = new Set<(context: SlashCommandContext) => void>();

  getNodes = (): IterableIterator<Klass<LexicalNode>> => {
    return this.#nodes.values();
  };

  getTheme = (): EditorThemeClasses => {
    return [...this.#themes].reduce(
      (prev: EditorThemeClasses, cur) => ({ ...prev, ...cur }),
      {}
    );
  };

  getSlashCommands = (
    editor: LexicalEditor,
    queryString: string
  ): SlashCommandMenu[] => {
    const priorityCommandsMap = new Map<number, Array<SlashCommand>>();
    const priorityDynamicCommandsMap = new Map<
      number,
      Array<DynamicSlashCommand>
    >();

    [...this.#slashCommands].forEach(render => {
      const context: SlashCommandContext = {
        editor,
        queryString,
        registerCommands: (commands, priority) => {
          const accCommands = priorityCommandsMap.get(priority) ?? [];
          accCommands.push(...commands);
          priorityCommandsMap.set(priority, accCommands);
        },
        registerDynamicCommands: (commands, priority) => {
          const accCommands = priorityDynamicCommandsMap.get(priority) ?? [];
          accCommands.push(...commands);
          priorityDynamicCommandsMap.set(priority, accCommands);
        },
      };
      render(context);
    });

    const commands = [...priorityCommandsMap.entries()]
      .sort(([a], [b]) => a - b)
      .reduce((acc: SlashCommand[], [__priority, commands]) => {
        acc.push(...commands);
        return acc;
      }, []);

    if (!queryString) {
      return commands.map(command => new SlashCommandMenu(command));
    }

    const regex = new RegExp(queryString, 'i');

    return [
      ...[...priorityDynamicCommandsMap.entries()]
        .sort(([a], [b]) => a - b)
        .reduce((acc: SlashCommand[], [__priority, commands]) => {
          acc.push(...commands);
          return acc;
        }, []),
      ...commands.filter(
        command =>
          regex.test(command.title) ||
          command.keywords?.some(keyword => regex.test(keyword))
      ),
    ].map(command => new SlashCommandMenu(command));
  };

  Plugins = (): React.ReactNode => {
    return createElement(
      Fragment,
      null,
      [...this.#plugins].map(Plugin =>
        createElement(Plugin, { key: `${Plugin.displayName}` })
      )
    );
  };

  registerNode = (...nodes: Array<Klass<LexicalNode>>): Dispose => {
    nodes.forEach(node => this.#nodes.add(node));
    return () => {
      nodes.forEach(node => this.#nodes.delete(node));
    };
  };

  registerTheme = (theme: EditorThemeClasses): Dispose => {
    this.#themes.add(theme);
    return () => {
      this.#themes.delete(theme);
    };
  };

  registerPlugin = (plugin: React.FC): Dispose => {
    this.#plugins.add(plugin);
    return () => {
      this.#plugins.delete(plugin);
    };
  };

  registerSlashCommand = (
    render: (context: SlashCommandContext) => void
  ): Dispose => {
    this.#slashCommands.add(render);
    return () => {
      this.#slashCommands.delete(render);
    };
  };

  registerDispose = (dispose: Dispose): Dispose => {
    this.#disposeSet.add(dispose);
    return () => {
      this.#disposeSet.delete(dispose);
    };
  };

  dispose = () => {
    this.#disposeSet.forEach(dispose => dispose());
    this.#disposeSet.clear();
    this.#nodes.clear();
    this.#themes.clear();
    this.#plugins.clear();
  };
}

export function createExtensionContext({
  registerNode,
  registerTheme,
  registerPlugin,
  registerSlashCommand,
}: ExtensionManager): ExtensionContext {
  const subscriptions = new Set<Dispose>();

  return {
    registerNode,
    registerTheme,
    registerPlugin,
    registerSlashCommand,
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
