import { createStore } from 'jotai';
import type {
  EditorThemeClasses,
  Klass,
  LexicalEditor,
  LexicalNode,
} from 'lexical';
import type { FC } from 'react';

import type { FloatingTextFormatButton } from './floating-text-format-toolbar';
import {
  type DynamicSlashCommand,
  type SlashCommand,
  type SlashCommandContext,
  SlashCommandMenu,
} from './slash-command';

export type ExtensionManager = {
  store: ReturnType<typeof createStore>;
  registerNode: (...nodes: Array<Klass<LexicalNode>>) => Dispose;
  getNodes: () => IterableIterator<Klass<LexicalNode>>;
  registerTheme: (theme: EditorThemeClasses) => Dispose;
  getTheme: () => EditorThemeClasses;
  registerSlashCommand: (
    render: (context: SlashCommandContext) => void
  ) => Dispose;
  getSlashCommands: (
    editor: LexicalEditor,
    queryString: string
  ) => SlashCommandMenu[];
  registerFloatingTextFormatButton: (
    ...buttons: FloatingTextFormatButton[]
  ) => Dispose;
  getFloatingTextFormatButtons: () => IterableIterator<FloatingTextFormatButton>;
  registerCommand: <P>(
    command: Command<P>,
    listener: CommandListener<P>
  ) => Dispose;
  executeCommand: <T extends Command<unknown>>(
    command: T,
    payload: CommandPayload<T>
  ) => void;
  registerDispose: (dispose: Dispose) => Dispose;
  dispose: () => void;
};

export type ExtensionContext = Pick<
  ExtensionManager,
  | 'store'
  | 'registerNode'
  | 'registerTheme'
  | 'registerSlashCommand'
  | 'registerFloatingTextFormatButton'
  | 'registerCommand'
  | 'executeCommand'
> & {
  subscriptions: Set<Dispose>;
};

export type Command<P> = {
  type: string;
};

export type CommandListener<P> = (payload: P) => void;

export type CommandPayload<T extends Command<unknown>> =
  T extends Command<infer P> ? P : never;

export type Dispose = () => void;

export type RegisterExtension = (context: ExtensionContext) => Dispose | void;

export type Extension<P = unknown> = RegisterExtension & {
  Plugin: FC<P>;
};

export type ConfigureExtensionOptions = {
  extensions: Array<Extension<any>>;
};

export function createCommand<T>(type: string): Command<T> {
  return { type };
}

const NoopPlugin: FC<unknown> = () => null;
NoopPlugin.displayName = 'NoopPlugin';

export function createExtension<P = unknown>(
  registerExtension: RegisterExtension,
  Plugin?: FC<P>
): Extension<P> {
  const extension: Extension<P> = context => registerExtension(context);
  extension.Plugin = Plugin ?? NoopPlugin;
  return extension;
}

function createExtensionManager(): ExtensionManager {
  const store = createStore();
  const disposeSet = new Set<Dispose>();
  const nodeSet = new Set<Klass<LexicalNode>>();
  const themeSet = new Set<EditorThemeClasses>();
  const slashCommandSet = new Set<(context: SlashCommandContext) => void>();
  const floatingTextFormatButtonSet = new Set<FloatingTextFormatButton>();
  const commandMap = new Map<Command<any>, Set<CommandListener<any>>>();

  const registerNode = (...nodes: Array<Klass<LexicalNode>>): Dispose => {
    nodes.forEach(node => nodeSet.add(node));
    return () => nodes.forEach(node => nodeSet.delete(node));
  };
  const getNodes = (): IterableIterator<Klass<LexicalNode>> => {
    return nodeSet.values();
  };

  const registerTheme = (theme: EditorThemeClasses): Dispose => {
    themeSet.add(theme);
    return () => themeSet.delete(theme);
  };
  const getTheme = (): EditorThemeClasses => {
    return [...themeSet].reduce(
      (prev: EditorThemeClasses, cur) => ({ ...prev, ...cur }),
      {}
    );
  };

  const registerSlashCommand = (
    render: (context: SlashCommandContext) => void
  ): Dispose => {
    slashCommandSet.add(render);
    return () => slashCommandSet.delete(render);
  };
  const getSlashCommands = (
    editor: LexicalEditor,
    queryString: string
  ): SlashCommandMenu[] => {
    const priorityCommandsMap = new Map<number, Array<SlashCommand>>();
    const priorityDynamicCommandsMap = new Map<
      number,
      Array<DynamicSlashCommand>
    >();

    [...slashCommandSet].forEach(render => {
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

  const registerFloatingTextFormatButton = (
    ...buttons: FloatingTextFormatButton[]
  ): Dispose => {
    buttons.forEach(button => floatingTextFormatButtonSet.add(button));
    return () => {
      buttons.forEach(button => floatingTextFormatButtonSet.delete(button));
    };
  };
  const getFloatingTextFormatButtons =
    (): IterableIterator<FloatingTextFormatButton> => {
      return floatingTextFormatButtonSet.values();
    };

  const registerCommand = <P>(
    command: Command<P>,
    listener: CommandListener<P>
  ): Dispose => {
    const listeners = commandMap.get(command) ?? new Set();
    listeners.add(listener);

    if (!commandMap.has(command)) {
      commandMap.set(command, listeners);
    }

    return () => listeners.delete(listener);
  };
  const executeCommand = <P>(command: Command<P>, payload: P): void => {
    const listeners = commandMap.get(command);
    listeners?.forEach(listener => listener(payload));
  };

  const registerDispose = (dispose: Dispose): Dispose => {
    disposeSet.add(dispose);
    return () => disposeSet.delete(dispose);
  };
  const dispose = () => {
    disposeSet.forEach(dispose => dispose());
    disposeSet.clear();
    nodeSet.clear();
    themeSet.clear();
    slashCommandSet.clear();
    floatingTextFormatButtonSet.clear();
    commandMap.forEach(listeners => listeners.clear());
    commandMap.clear();
  };

  return Object.freeze({
    store,
    registerNode,
    getNodes,
    registerTheme,
    getTheme,
    registerSlashCommand,
    getSlashCommands,
    registerFloatingTextFormatButton,
    getFloatingTextFormatButtons,
    registerCommand,
    executeCommand,
    registerDispose,
    dispose,
  });
}

export function createExtensionContext({
  store,
  registerNode,
  registerTheme,
  registerSlashCommand,
  registerFloatingTextFormatButton,
  registerCommand,
  executeCommand,
}: ExtensionManager): ExtensionContext {
  const subscriptions = new Set<Dispose>();

  return Object.freeze({
    store,
    registerNode,
    registerTheme,
    registerSlashCommand,
    registerFloatingTextFormatButton,
    registerCommand,
    executeCommand,
    subscriptions,
  });
}

export function configureExtensions({
  extensions,
}: ConfigureExtensionOptions): ExtensionManager {
  const manager = createExtensionManager();
  const contextSet = new Set<ExtensionContext>();
  const subscriptions = new Set<Dispose | void>();

  extensions.forEach(registerExtension => {
    const context = createExtensionContext(manager);
    subscriptions.add(registerExtension(context));
    contextSet.add(context);
  });

  manager.registerDispose(() => {
    contextSet.forEach(context => {
      context.subscriptions.forEach(dispose => dispose());
      context.subscriptions.clear();
    });
    contextSet.clear();
    subscriptions.forEach(dispose => dispose?.());
    subscriptions.clear();
  });

  return manager;
}
