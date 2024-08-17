import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { LexicalEditor } from 'lexical';

export type SlashCommandContext = {
  editor: LexicalEditor;
  queryString: string;
  slashCommands: SlashCommand[];
  dynamicSlashCommands: DynamicSlashCommand[];
};

export type SlashCommand = {
  title: string;
  icon?: React.ReactNode;
  keywords?: string[];
  onSelect: (queryString: string) => void;
};

export type DynamicSlashCommand = {
  title: string;
  icon?: React.ReactNode;
  onSelect: (queryString: string) => void;
};

export class SlashCommandMenu extends MenuOption implements SlashCommand {
  title: string;
  icon?: React.ReactNode;
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
