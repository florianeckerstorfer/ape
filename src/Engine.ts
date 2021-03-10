import { Operation } from './operations/operation';
import { MapOperation, mapFn, isMapOperation } from './operations/map';
import {
  MapValueOperation,
  mapValueFn,
  isMapValueOperation,
} from './operations/mapValue';
import {
  RenameKeyOperation,
  isRenameKeyOperation,
} from './operations/renameKey';
import {
  MergeByIndexOperation,
  isMergeByIndexOperation,
} from './operations/mergeByIndex';

type RecordKey = string | number;

type Index = Record<RecordKey, number>;

class Engine<R extends Record<RecordKey, unknown>> {
  private data: R[];
  private operations: Operation[] = [];
  private indices: Record<string, Index> = {};

  public constructor(data: R[]) {
    this.data = data;
  }

  public map<NR>(mapFn: mapFn<R, NR>): Engine<R> {
    type Op = MapOperation<R, NR>;
    const operation = { type: 'map', map: mapFn } as Op;
    return this.addOperation(operation);
  }

  public mapValue<K extends string | number, NV>(
    key: K,
    mapValue: mapValueFn<R, K, NV>
  ): Engine<R> {
    type Op = MapValueOperation<R, K, NV>;
    const operation = { type: 'mapValue', key, mapValue } as Op;
    return this.addOperation(operation);
  }

  public renameKey<K extends RecordKey, NK extends RecordKey>(
    key: K,
    newKey: NK
  ): Engine<R> {
    type Op = RenameKeyOperation<K, NK>;
    const operation = { type: 'mapKey', key, newKey } as Op;
    return this.addOperation(operation);
  }

  public mergeByIndex<
    K extends RecordKey,
    E extends Engine<Record<RecordKey, unknown>>
  >(keys: K[], data: E): Engine<R> {
    type Op = MergeByIndexOperation<K, E>;
    const operation = {
      type: 'mergeByIndex',
      keys,
      data,
    } as Op;
    return this.addOperation(operation);
  }

  public createIndex<K extends RecordKey>(keys: K | K[]): Engine<R> {
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
  ): R | undefined {
    const indexName = Object.keys(query).join('_');
    if (!this.indices[indexName]) {
      throw new Error(`Ape Engine does not have index: ${indexName}`);
    }
    const itemKey = Object.keys(query)
      .map((key) => query[key])
      .join('_');
    return this.data[this.indices[indexName][itemKey]] || undefined;
  }

  public process(): Record<RecordKey, unknown>[] {
    return this.data.map((record: Record<RecordKey, unknown>) => {
      let newRecord = record;
      for (const operation of this.operations) {
        if (isMapOperation(operation)) {
          newRecord = operation.map(newRecord);
        } else if (isMapValueOperation(operation)) {
          newRecord[operation.key] = operation.mapValue(
            newRecord[operation.key]
          );
        } else if (isRenameKeyOperation(operation)) {
          newRecord[operation.newKey] = newRecord[operation.key];
          delete newRecord[operation.key];
        } else if (isMergeByIndexOperation(operation)) {
          const query = {};
          operation.keys.forEach((key) => {
            query[key] = newRecord[key];
          });
          const mergeItem = operation.data.findByIndex(query);
          newRecord = { ...newRecord, ...mergeItem };
        }
      }
      return newRecord;
    });
  }

  private addOperation(operation: Operation): Engine<R> {
    this.operations.push(operation);
    return this;
  }
}

export default Engine;
