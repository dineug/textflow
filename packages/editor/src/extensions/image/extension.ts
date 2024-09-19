import { FileImage, Image } from 'lucide-react';

import { createExtension } from '@/extensions/extensionManager';

import { ImageNode } from './ImageNode';
import ImagePlugin from './ImagePlugin';
import { insertImageFileCommand } from './InsertImageFile';
import { showInsertImageURLModalCommand } from './InsertImageURL';
import * as styles from './theme.css';

export const extensionImage = createExtension(
  ({
    subscriptions,
    registerNode,
    registerTheme,
    registerSlashCommand,
    executeCommand,
  }) => {
    subscriptions
      .add(registerNode(ImageNode))
      .add(
        registerTheme({
          image: styles.image,
        })
      )
      .add(
        registerSlashCommand(({ registerCommands }) => {
          registerCommands(
            [
              {
                title: 'Image File',
                Icon: FileImage,
                keywords: ['image', 'photo', 'picture', 'file', 'img'],
                onSelect: () => {
                  executeCommand(insertImageFileCommand, undefined);
                },
              },
              {
                title: 'Image URL',
                Icon: Image,
                keywords: ['image', 'photo', 'picture', 'file', 'img'],
                onSelect: () => {
                  executeCommand(showInsertImageURLModalCommand, undefined);
                },
              },
            ],
            0
          );
        })
      );
  },
  ImagePlugin
);
