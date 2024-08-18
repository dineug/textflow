import React from 'react';
import ReactDOM from 'react-dom/client';

import { Editor } from './index.ts';

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Editor minHeight="100vh" />
  </React.StrictMode>
);
