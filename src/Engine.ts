type OperationType = 'map' | 'mapValue' | 'mapKey';

type RecordKey = string | number;

type mapFn<I> = (item: I) => Record<RecordKey, unknown>;
type mapValueFn<I extends Record<K, V>, K extends RecordKey, V> = (
  value: I[K]
) => I[K];
type mapKeyFn<K> = (key: K) => RecordKey;

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

interface MapKeyOperation<K extends RecordKey> extends Operation {
  type: 'mapKey';
  key: K;
  mapKey: mapKeyFn<K>;
}

function isMapOperation<I>(operation: Operation): operation is MapOperation<I> {
  return operation.type === 'map';
}

function isMapValueOperation<I extends Record<K, V>, K extends RecordKey, V>(
  operation: Operation
): operation is MapValueOperation<I, K, V> {
  return operation.type === 'mapValue';
}

function isMapKeyOperation<K extends RecordKey>(
  operation: Operation
): operation is MapKeyOperation<K> {
  return operation.type === 'mapKey';
}

class Engine<I extends Record<RecordKey, unknown>> {
  private items: I[];
  private operations: Operation[] = [];

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

  public mapKey<K extends RecordKey>(key: K, mapKey: mapKeyFn<K>): Engine<I> {
    const operation = { type: 'mapKey', key, mapKey } as MapKeyOperation<K>;
    return this.addOperation(operation);
  }

  public process(): Record<RecordKey, unknown>[] {
    return this.items.map((item: Record<RecordKey, unknown>) => {
      let newItem = item;
      for (const operation of this.operations) {
        if (isMapOperation(operation)) {
          newItem = operation.map(newItem);
        } else if (isMapValueOperation(operation)) {
          newItem[operation.key] = operation.mapValue(item[operation.key]);
        } else if (isMapKeyOperation(operation)) {
          newItem[operation.mapKey(operation.key)] = item[operation.key];
          delete item[operation.key];
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
