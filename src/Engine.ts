type OperationType = 'map' | 'mapValue' | 'mapKey';

type RecordKey = string | number;

type mapFn<I> = (item: I) => Record<RecordKey, unknown>;
type mapValueFn<I extends Record<K, V>, K extends RecordKey, V> = (
  value: I[K]
) => I[K];

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

class Engine<I extends Record<RecordKey, unknown>> {
  private items: I[];
  private operations: Operation[] = [];
  private indices: Record<string, Index> = {};

  public constructor(items: I[]) {
    this.items = items;
  }

  public map(mapFn: mapFn<I>): Engine<I> {
    const operation = { type: 'map', map: mapFn } as MapOperation<I>;
    return this.addOperation(operation);
  }

  public mapValue<K extends RecordKey>(
    key: K,
    mapValue: mapValueFn<I, K, I[K]>
  ): Engine<I> {
    const operation = { type: 'mapValue', key, mapValue } as MapValueOperation<
      I,
      K,
      I[K]
    >;
    return this.addOperation(operation);
  }

  public renameKey<K1 extends RecordKey, K2 extends RecordKey>(
    key: K1,
    newKey: K2
  ): Engine<I> {
    const operation = { type: 'mapKey', key, newKey } as RenameKeyOperation<
      K1,
      K2
    >;
    return this.addOperation(operation);
  }

  public createIndex<K extends RecordKey>(keys: K | K[]): Engine<I> {
    const keysArr = !Array.isArray(keys) ? [keys] : keys;
    const indexName = keysArr.join('_');
    this.indices[indexName] = {};
    this.process().forEach((item, i) => {
      const itemKey = keysArr.map((key) => item[key]).join('_');
      this.indices[indexName][itemKey] = i;
    });
    return this;
  }

  public findByIndex<K extends RecordKey>(
    query: Record<K, unknown>
  ): I | undefined {
    const indexName = Object.keys(query).join('_');
    if (!this.indices[indexName]) {
      throw new Error(`Ape Engine does not have index: ${indexName}`);
    }
    const itemKey = Object.keys(query)
      .map((key) => query[key])
      .join('_');
    return this.items[this.indices[indexName][itemKey]] || undefined;
  }

  public process(): Record<RecordKey, unknown>[] {
    return this.items.map((item: Record<RecordKey, unknown>) => {
      let newItem = item;
      for (const operation of this.operations) {
        if (isMapOperation(operation)) {
          newItem = operation.map(newItem);
        } else if (isMapValueOperation(operation)) {
          newItem[operation.key] = operation.mapValue(newItem[operation.key]);
        } else if (isRenameKeyOperation(operation)) {
          newItem[operation.newKey] = newItem[operation.key];
          delete newItem[operation.key];
        }
      }
      return newItem;
    });
  }

  private addOperation(operation: Operation): Engine<I> {
    this.operations.push(operation);
    return this;
  }
}

export default Engine;
