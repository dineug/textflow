import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import { lazy, Suspense } from 'react';

const ReferenceComponent = lazy(() => import('./ReferenceComponent'));

export type SerializedReferenceNode = Spread<
  {
    title: string;
    relativePath: string;
  },
  SerializedLexicalNode
>;

function $convertReferenceElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const relativePath = domNode.getAttribute(
    'data-lexical-reference-relative-path'
  );
  const title = domNode.getAttribute('data-lexical-reference-title');

  if (relativePath !== null) {
    const node = $createReferenceNode({
      relativePath,
      title: title ?? relativePath,
    });
    return { node };
  }

  return null;
}

export class ReferenceNode extends DecoratorNode<JSX.Element> {
  __title: string;
  __relativePath: string;

  static getType(): string {
    return 'reference';
  }

  static clone(node: ReferenceNode): ReferenceNode {
    return new ReferenceNode(node.__title, node.__relativePath, node.__key);
  }

  static importJSON(serializedNode: SerializedReferenceNode): ReferenceNode {
    const { title, relativePath } = serializedNode;
    const node = $createReferenceNode({ title, relativePath });
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-reference-relative-path')) {
          return null;
        }

        return {
          conversion: $convertReferenceElement,
          priority: 2,
        };
      },
    };
  }

  constructor(title: string, relativePath: string, key?: NodeKey) {
    super(key);
    this.__title = title;
    this.__relativePath = relativePath;
  }

  exportJSON(): SerializedReferenceNode {
    return {
      title: this.__title,
      relativePath: this.__relativePath,
      type: 'reference',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute(
      'data-lexical-reference-relative-path',
      this.__relativePath
    );
    element.setAttribute('data-lexical-reference-title', this.__title);
    element.textContent = this.__title;
    return { element };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.reference;

    if (className) {
      span.className = className;
    }

    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ReferenceComponent
          title={this.__title}
          relativePath={this.__relativePath}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

type ReferencePayload = {
  title: string;
  relativePath: string;
};

export function $createReferenceNode({
  title,
  relativePath,
}: ReferencePayload): ReferenceNode {
  return $applyNodeReplacement(new ReferenceNode(title, relativePath));
}

export function $isReferenceNode(
  node: LexicalNode | null | undefined
): node is ReferenceNode {
  return node instanceof ReferenceNode;
}
