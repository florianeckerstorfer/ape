import { Operation } from './operation';

export type mapFn<R, MR> = (record: R) => Record<string | number, MR>;

export interface MapOperation<R, MR> extends Operation {
  type: 'map';
  map: mapFn<R, MR>;
}

export function isMapOperation<R, MR>(
  operation: Operation
): operation is MapOperation<R, MR> {
  return operation.type === 'map';
}
