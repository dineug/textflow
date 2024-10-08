import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-docker.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-toml.js';
import 'prismjs/components/prism-bash.js';

export const Prism: typeof import('prismjs') = globalThis.Prism || window.Prism;

export const LANGUAGES: Array<{
  label: string;
  value: string;
  keywords?: string[];
}> = [
  { label: 'Bash', value: 'bash', keywords: ['sh', 'shell'] },
  { label: 'C', value: 'c' },
  { label: 'C#', value: 'csharp', keywords: ['C#'] },
  { label: 'C++', value: 'cpp', keywords: ['C++'] },
  { label: 'CSS', value: 'css' },
  { label: 'Docker', value: 'docker' },
  { label: 'Go', value: 'go' },
  { label: 'HTML', value: 'html' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'js', keywords: ['javascript'] },
  { label: 'JSX', value: 'jsx', keywords: ['javascript'] },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown', keywords: ['md'] },
  { label: 'Objective-C', value: 'objc', keywords: ['Objective-C'] },
  { label: 'Plain Text', value: 'plain', keywords: ['text', 'txt'] },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Python', value: 'py', keywords: ['Python'] },
  { label: 'Rust', value: 'rust' },
  { label: 'SQL', value: 'sql' },
  { label: 'Shell', value: 'shell', keywords: ['bash'] },
  { label: 'Shell Script (sh)', value: 'sh', keywords: ['shell', 'bash'] },
  { label: 'Swift', value: 'swift' },
  { label: 'TOML', value: 'toml' },
  { label: 'TSX', value: 'tsx', keywords: ['typescript'] },
  { label: 'TypeScript', value: 'ts', keywords: ['typescript'] },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
];
