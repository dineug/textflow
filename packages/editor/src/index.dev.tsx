import React from 'react';
import ReactDOM from 'react-dom/client';

import { Editor } from './index.ts';

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Editor minHeight="calc(100vh - 57px)" autofocus />
  </React.StrictMode>
);
