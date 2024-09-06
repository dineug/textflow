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

export type Dispose = () => void;

export type Command<P> = {
  type: string;
};

export type CommandListener<P> = (payload: P) => void;

export function createCommand<T>(type: string): Command<T> {
  return { type };
}

export type ExtensionContext = {
  registerNode: (...nodes: Array<Klass<LexicalNode>>) => Dispose;
  registerTheme: (theme: EditorThemeClasses) => Dispose;
  registerSlashCommand: (
    render: (context: SlashCommandContext) => void
  ) => Dispose;
  registerFloatingTextFormatButton: (
    ...buttons: FloatingTextFormatButton[]
  ) => Dispose;
  registerCommand: <P>(
    command: Command<P>,
    listener: CommandListener<P>
  ) => Dispose;
  executeCommand: <P>(command: Command<P>, payload: P) => void;
  subscriptions: Set<Dispose>;
};

export type RegisterExtension = (context: ExtensionContext) => Dispose | void;

export type Extension<P = unknown> = RegisterExtension & {
  Plugin: FC<P>;
};

const NoopPlugin: FC<unknown> = () => null;
NoopPlugin.displayName = 'NoopPlugin';

export function createExtension<P = unknown>(
  registerExtension: RegisterExtension,
  Plugin?: FC<P>
): Extension<P> {
  function extension(context: ExtensionContext): Dispose | void {
    registerExtension(context);
  }
  extension.Plugin = Plugin ?? NoopPlugin;
  return extension;
}

export type ConfigureExtensionOptions = {
  extensions: Array<Extension<any>>;
};

export class ExtensionManager {
  #disposeSet = new Set<Dispose>();
  #nodes = new Set<Klass<LexicalNode>>();
  #themes = new Set<EditorThemeClasses>();
  #slashCommands = new Set<(context: SlashCommandContext) => void>();
  #floatingTextFormatButtons = new Set<FloatingTextFormatButton>();
  #commands = new Map<Command<any>, Set<CommandListener<any>>>();

  getNodes = (): IterableIterator<Klass<LexicalNode>> => {
    return this.#nodes.values();
  };

  getTheme = (): EditorThemeClasses => {
    return [...this.#themes].reduce(
      (prev: EditorThemeClasses, cur) => ({ ...prev, ...cur }),
      {}
    );
  };

  getFloatingTextFormatButtons =
    (): IterableIterator<FloatingTextFormatButton> => {
      return this.#floatingTextFormatButtons.values();
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

  registerSlashCommand = (
    render: (context: SlashCommandContext) => void
  ): Dispose => {
    this.#slashCommands.add(render);
    return () => {
      this.#slashCommands.delete(render);
    };
  };

  registerFloatingTextFormatButton = (
    ...buttons: FloatingTextFormatButton[]
  ): Dispose => {
    buttons.forEach(button => this.#floatingTextFormatButtons.add(button));
    return () => {
      buttons.forEach(button => this.#floatingTextFormatButtons.delete(button));
    };
  };

  registerDispose = (dispose: Dispose): Dispose => {
    this.#disposeSet.add(dispose);
    return () => {
      this.#disposeSet.delete(dispose);
    };
  };

  registerCommand = <P>(
    command: Command<P>,
    listener: CommandListener<P>
  ): Dispose => {
    const listeners = this.#commands.get(command) ?? new Set();
    listeners.add(listener);

    if (!this.#commands.has(command)) {
      this.#commands.set(command, listeners);
    }

    return () => {
      listeners.delete(listener);
    };
  };

  executeCommand = <P>(command: Command<P>, payload: P): void => {
    const listeners = this.#commands.get(command);
    listeners?.forEach(listener => listener(payload));
  };

  dispose = () => {
    this.#disposeSet.forEach(dispose => dispose());
    this.#disposeSet.clear();
    this.#nodes.clear();
    this.#themes.clear();
    this.#slashCommands.clear();
    this.#floatingTextFormatButtons.clear();
    this.#commands.clear();
  };
}

export function createExtensionContext({
  registerNode,
  registerTheme,
  registerSlashCommand,
  registerFloatingTextFormatButton,
  registerCommand,
  executeCommand,
}: ExtensionManager): ExtensionContext {
  const subscriptions = new Set<Dispose>();

  return {
    registerNode,
    registerTheme,
    registerSlashCommand,
    registerFloatingTextFormatButton,
    registerCommand,
    executeCommand,
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
