import './webview.css';
import 'core-js/stable';

import { createRoot } from 'react-dom/client';

import App from './App';

document.getElementById('_defaultStyles')?.remove();
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
