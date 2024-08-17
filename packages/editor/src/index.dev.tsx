import React from 'react';
import ReactDOM from 'react-dom/client';

import { Editor } from './index.ts';

const root = ReactDOM.createRoot(document.body);
root.render(
  <React.StrictMode>
    <Editor minHeight="100vh" />
  </React.StrictMode>
);
