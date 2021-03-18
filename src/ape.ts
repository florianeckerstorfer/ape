type OperationType = 'map' | 'mapValue' | 'mapKey' | 'mergeByIndex';

type RecordKey = string | number;

type mapFn<R> = (
  record: R,
  index: number,
  records: R[]
) => Record<RecordKey, unknown>;

type mapValueFn<R extends Record<K, V>, K extends RecordKey, V> = (
  value: R[K],
  key: K,
  index: number,
  records: R[]
) => unknown;

type Index = Record<RecordKey, number>;

interface Operation {
  type: OperationType;
}

interface MapOperation<I> extends Operation {
  type: 'map';
  map: mapFn<I>;
}

interface MapValueOperation<I extends Record<K, V>, K extends RecordKey, V>
  extends Operation {
  type: 'mapValue';
  key: K;
  mapValue: mapValueFn<I, K, V>;
}

interface RenameKeyOperation<K extends RecordKey, NewKey extends RecordKey>
  extends Operation {
  type: 'mapKey';
  key: K;
  newKey: NewKey;
}

interface MergeByIndexOperation<
  K extends RecordKey,
  A extends Ape<Record<RecordKey, unknown>>
> extends Operation {
  type: 'mergeByIndex';
  keys: K[];
  ape: A;
}

function isMapOperation<I>(operation: Operation): operation is MapOperation<I> {
  return operation.type === 'map';
}

function isMapValueOperation<I extends Record<K, V>, K extends RecordKey, V>(
  operation: Operation
): operation is MapValueOperation<I, K, V> {
  return operation.type === 'mapValue';
}

function isRenameKeyOperation<K1 extends RecordKey, K2 extends RecordKey>(
  operation: Operation
): operation is RenameKeyOperation<K1, K2> {
  return operation.type === 'mapKey';
}

function isMergeByIndexOperation<
  K extends RecordKey,
  E extends Ape<Record<RecordKey, unknown>>
>(operation: Operation): operation is MergeByIndexOperation<K, E> {
  return operation.type === 'mergeByIndex';
}

class Ape<R extends Record<RecordKey, unknown>> {
  private records: R[];
  private operations: Operation[] = [];
  private indices: Record<string, Index> = {};

  public constructor(items: R[]) {
    this.records = items;
  }

  public map(mapFn: mapFn<R>): Ape<R> {
    const operation = { type: 'map', map: mapFn } as MapOperation<R>;
    return this.addOperation(operation);
  }

  public mapValue<K extends RecordKey>(
    key: K,
    mapValue: mapValueFn<R, K, R[K]>
  ): Ape<R> {
    const operation: MapValueOperation<R, K, R[K]> = {
      type: 'mapValue',
      key,
      mapValue,
    };
    return this.addOperation(operation);
  }

  public renameKey<K1 extends RecordKey, K2 extends RecordKey>(
    key: K1,
    newKey: K2
  ): Ape<R> {
    const operation: RenameKeyOperation<K1, K2> = {
      type: 'mapKey',
      key,
      newKey,
    };
    return this.addOperation(operation);
  }

  public mergeByIndex<
    K extends RecordKey,
    A extends Ape<Record<RecordKey, unknown>>
  >(keys: K | K[], ape: A): Ape<R> {
    const operation: MergeByIndexOperation<K, A> = {
      type: 'mergeByIndex',
      keys: Array.isArray(keys) ? keys : [keys],
      ape,
    };
    return this.addOperation(operation);
  }

  public createIndex<K extends RecordKey>(keys: K | K[]): Ape<R> {
    const keysArr = !Array.isArray(keys) ? [keys] : keys;
    const indexName = keysArr.join('_');
    this.indices[indexName] = {};
    this.process().forEach((item, i) => {
      const itemKey = keysArr.map((key) => item[key]).join('_');
      this.indices[indexName][itemKey] = i;
    });
    return this;
  }

  public findByIndex(query: Partial<R>): R | undefined {
    const indexName = Object.keys(query).join('_');
    if (!this.indices[indexName]) {
      throw new Error(`No index exists for "${indexName}"`);
    }
    const itemKey = Object.keys(query)
      .map((key) => query[key])
      .join('_');
    return this.records[this.indices[indexName][itemKey]] || undefined;
  }

  public process(): Record<RecordKey, unknown>[] {
    return this.records.map(
      (record: Record<RecordKey, unknown>, index: number) => {
        let newRecord = record;
        for (const operation of this.operations) {
          if (isMapOperation(operation)) {
            newRecord = operation.map(newRecord, index, this.records);
          } else if (isMapValueOperation(operation)) {
            newRecord[operation.key] = operation.mapValue(
              newRecord[operation.key],
              operation.key,
              index,
              this.records
            );
          } else if (isRenameKeyOperation(operation)) {
            newRecord = {
              ...newRecord,
              [operation.newKey]: newRecord[operation.key],
            };
            delete newRecord[operation.key];
          } else if (isMergeByIndexOperation(operation)) {
            const query: { [K in RecordKey]: unknown } = {};
            operation.keys.forEach((key) => {
              query[key] = newRecord[key];
            });
            const mergeItem = operation.ape.findByIndex(query);
            newRecord = { ...newRecord, ...mergeItem };
          }
        }
        return newRecord;
      }
    );
  }

  private addOperation(operation: Operation): Ape<R> {
    this.operations.push(operation);
    return this;
  }
}

export default Ape;
