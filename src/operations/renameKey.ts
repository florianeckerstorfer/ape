import { Operation } from './operation';

export interface RenameKeyOperation<
  K extends string | number,
  NK extends string | number
> extends Operation {
  type: 'mapKey';
  key: K;
  newKey: NK;
}

export function isRenameKeyOperation<
  K extends string | number,
  NK extends string | number
>(operation: Operation): operation is RenameKeyOperation<K, NK> {
  return operation.type === 'mapKey';
}
