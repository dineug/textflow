import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';

export type EmojiOption = {
  title: string;
  emoji: string;
  keywords: string[];
  tags: string[];
};

export class EmojiMenuOption extends MenuOption implements EmojiOption {
  title: string;
  emoji: string;
  keywords: string[];
  tags: string[];

  constructor(option: EmojiOption) {
    super(option.emoji);
    this.title = option.title;
    this.emoji = option.emoji;
    this.keywords = option.keywords;
    this.tags = option.tags;
  }
}
