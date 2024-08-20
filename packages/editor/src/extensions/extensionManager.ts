import { Transformer } from '@lexical/markdown';
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
  registerPlugin: (...plugins: Array<React.FC>) => Dispose;
  registerTransformer: (...transformers: Transformer[]) => Dispose;
  registerTheme: (theme: EditorThemeClasses) => Dispose;
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
  #plugins = new Set<React.FC>();
  #transformers = new Set<Transformer>();
  #themes = new Set<EditorThemeClasses>();
  #slashCommands = new Set<(context: SlashCommandContext) => void>();

  getNodes = (): IterableIterator<Klass<LexicalNode>> => {
    return this.#nodes.values();
  };

  getTransformers = (): IterableIterator<Transformer> => {
    return this.#transformers.values();
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

  registerPlugin = (...plugins: Array<React.FC>): Dispose => {
    plugins.forEach(plugin => this.#plugins.add(plugin));
    return () => {
      plugins.forEach(plugin => this.#plugins.delete(plugin));
    };
  };

  registerTransformer = (...transformers: Transformer[]): Dispose => {
    transformers.forEach(transformer => this.#transformers.add(transformer));
    return () => {
      transformers.forEach(transformer =>
        this.#transformers.delete(transformer)
      );
    };
  };

  registerTheme = (theme: EditorThemeClasses): Dispose => {
    this.#themes.add(theme);
    return () => {
      this.#themes.delete(theme);
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
  registerPlugin,
  registerTransformer,
  registerTheme,
  registerSlashCommand,
}: ExtensionManager): ExtensionContext {
  const subscriptions = new Set<Dispose>();

  return {
    registerNode,
    registerPlugin,
    registerTransformer,
    registerTheme,
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
