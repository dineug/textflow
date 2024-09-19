import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { LexicalEditor } from 'lexical';

export type SlashCommandContext = {
  editor: LexicalEditor;
  queryString: string;
  registerCommands: (commands: SlashCommand[], priority: number) => void;
};

export type RegisterSlashCommands = (
  context: SlashCommandContext
) => void | Promise<void>;

export type SlashCommand = {
  title: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  keywords?: string[];
  onSelect: (queryString: string) => void;
};

export class SlashCommandMenu extends MenuOption implements SlashCommand {
  title: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  keywords?: Array<string>;
  onSelect: (queryString: string) => void;

  constructor(command: SlashCommand) {
    super(command.title);
    this.title = command.title;
    this.keywords = command.keywords;
    this.Icon = command.Icon;
    this.onSelect = command.onSelect.bind(this);
  }
}
