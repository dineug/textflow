import {
  type AnyAction,
  Bridge,
  hostUpdateReferenceListCommand,
  workerFindReferenceListCommand,
} from '@dineug/textflow-editor-vscode-bridge';
import { glob } from 'glob';
import { basename } from 'path';
import { parentPort } from 'worker_threads';

const bridge = new Bridge();

const dispatch = (action: AnyAction) => {
  parentPort?.postMessage(action);
};

Bridge.mergeRegister(
  bridge.registerCommand(workerFindReferenceListCommand, rootFolders => {
    Promise.all(
      rootFolders.map(rootPath =>
        glob(`${rootPath}/**/*.txf.json`, {
          ignore: '**/node_modules/**',
          nodir: true,
        })
      )
    ).then(groups => {
      dispatch(
        Bridge.executeCommand(
          hostUpdateReferenceListCommand,
          groups.flat().map(path => ({
            title: basename(path, '.txf.json'),
            path,
          }))
        )
      );
    });
  })
);

parentPort?.on('message', data => {
  bridge.executeAction(data);
});
