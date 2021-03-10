import { Operation } from './operation';

export type mapValueFn<
  R extends Record<K, unknown>,
  K extends string | number,
  NV
> = (value: R[K]) => NV;

export interface MapValueOperation<
  R extends Record<K, unknown>,
  K extends string | number,
  NV
> extends Operation {
  type: 'mapValue';
  key: K;
  mapValue: mapValueFn<R, K, NV>;
}

export function isMapValueOperation<
  R extends Record<K, unknown>,
  K extends string | number,
  NV
>(operation: Operation): operation is MapValueOperation<R, K, NV> {
  return operation.type === 'mapValue';
}
