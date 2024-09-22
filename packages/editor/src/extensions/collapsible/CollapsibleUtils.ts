// https://github.com/facebook/lexical/tree/main/packages/lexical-playground

export function setDomHiddenUntilFound(dom: HTMLElement): void {
  // @ts-expect-error
  dom.hidden = 'until-found';
}

export function domOnBeforeMatch(dom: HTMLElement, callback: () => void): void {
  // @ts-expect-error
  dom.onbeforematch = callback;
}
