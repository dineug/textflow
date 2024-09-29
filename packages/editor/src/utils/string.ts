import { camelCase, upperFirst } from 'lodash-es';

export function pascalCase(value?: string) {
  return upperFirst(camelCase(value));
}
