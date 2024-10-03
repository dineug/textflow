import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';

export type ReferenceMenuOption = {
  title: string;
  path: string;
  relativePath: string;
};

export class ReferenceMenu extends MenuOption implements ReferenceMenuOption {
  title: string;
  path: string;
  relativePath: string;

  constructor(option: ReferenceMenuOption) {
    super(option.path);
    this.title = option.title;
    this.path = option.path;
    this.relativePath = option.relativePath;
  }
}
