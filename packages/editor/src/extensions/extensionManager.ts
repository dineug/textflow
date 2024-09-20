import { createStore } from 'jotai';
import type { EditorThemeClasses, Klass, LexicalNode } from 'lexical';
import { type FC, memo } from 'react';

import type { FloatingTextFormatButton } from './floating-text-format-toolbar';
import { type RegisterSlashCommands } from './slash-command';

export type ExtensionManager = {
  store: ReturnType<typeof createStore>;
  registerNode: (...nodes: Array<Klass<LexicalNode>>) => Dispose;
  getNodes: () => IterableIterator<Klass<LexicalNode>>;
  registerTheme: (theme: EditorThemeClasses) => Dispose;
  getTheme: () => EditorThemeClasses;
  registerSlashCommand: (register: RegisterSlashCommands) => Dispose;
  getSlashCommands: () => IterableIterator<RegisterSlashCommands>;
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

export function createCommand<T = void>(type: string): Command<T> {
  return { type };
}

const NoopPlugin: FC<unknown> = () => null;
NoopPlugin.displayName = 'NoopPlugin';

export function createExtension<P = unknown>(
  registerExtension: RegisterExtension,
  Plugin?: FC<P>
): Extension<P> {
  const extension: Extension<P> = context => registerExtension(context);
  extension.Plugin = memo(Plugin ?? NoopPlugin);
  return extension;
}

function createExtensionManager(): ExtensionManager {
  const store = createStore();
  const disposeSet = new Set<Dispose>();
  const nodeSet = new Set<Klass<LexicalNode>>();
  const themeSet = new Set<EditorThemeClasses>();
  const slashCommandSet = new Set<RegisterSlashCommands>();
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

  const registerSlashCommand = (register: RegisterSlashCommands): Dispose => {
    slashCommandSet.add(register);
    return () => slashCommandSet.delete(register);
  };
  const getSlashCommands = (): IterableIterator<RegisterSlashCommands> => {
    return slashCommandSet.values();
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
    commandMap.set(command, listeners);
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
