import './index.ts';

import React from 'react';
import ReactDOM from 'react-dom/client';

import Editor from './Editor.tsx';

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Editor />
  </React.StrictMode>
);
