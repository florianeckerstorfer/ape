import { Operation } from './operation';
import Engine from '../Engine';

export interface MergeByIndexOperation<
  K extends string | number,
  E extends Engine<Record<string | number, unknown>>
> extends Operation {
  type: 'mergeByIndex';
  keys: K[];
  data: E;
}

export function isMergeByIndexOperation<
  K extends string | number,
  E extends Engine<Record<string | number, unknown>>
>(operation: Operation): operation is MergeByIndexOperation<K, E> {
  return operation.type === 'mergeByIndex';
}
