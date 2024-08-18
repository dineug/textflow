import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { LexicalEditor } from 'lexical';

export type SlashCommandContext = {
  editor: LexicalEditor;
  queryString: string;
  registerCommands: (commands: SlashCommand[], priority: number) => void;
  registerDynamicCommands: (
    commands: DynamicSlashCommand[],
    priority: number
  ) => void;
};

export type SlashCommand = {
  title: string;
  icon?: React.FC<React.SVGAttributes<SVGElement>>;
  keywords?: string[];
  onSelect: (queryString: string) => void;
};

export type DynamicSlashCommand = Omit<SlashCommand, 'keywords'>;

export class SlashCommandMenu extends MenuOption implements SlashCommand {
  title: string;
  icon?: React.FC<React.SVGAttributes<SVGElement>>;
  keywords?: Array<string>;
  onSelect: (queryString: string) => void;

  constructor(command: SlashCommand) {
    super(command.title);
    this.title = command.title;
    this.keywords = command.keywords;
    this.icon = command.icon;
    this.onSelect = command.onSelect.bind(this);
  }
}
