type OperationType =
  | 'map'
  | 'mapValue'
  | 'mapKey'
  | 'mergeByIndex'
  | 'addProperty';

/**
 * Key of a record.
 * @public
 */
export type RecordKey = string | number;

/**
 * Function that maps a record.
 *
 * @param record - Record to be mapped
 * @param index - Index of the record in the array
 * @param records - Array of records
 * @typeParam R - Record
 */
export type mapFn<R> = (
  record: R,
  index: number,
  records: R[]
) => Record<RecordKey, unknown>;

/**
 * Function that maps a single value of a record.
 *
 * @param value - Value to be mapped
 * @param key - Key of the value in the record
 * @param index - Index of the record in the array
 * @param records - Array of records
 * @typeParam R - Record
 * @typeParam K - Key
 * @typeParam V - Value
 */
export type mapValueFn<R extends Record<K, V>, K extends RecordKey, V> = (
  value: R[K],
  key: K,
  index: number,
  records: R[]
) => unknown;

/**
 * Function that takes a record, key, index and the whole array and returns the
 * value for the given key.
 *
 * @param record - Record the value will be added to
 * @param key - Key that the value will be assigned to
 * @param index - Index of the record in the array
 * @param records - Array of records
 * @typeParam R - Record
 * @typeParam K - Key
 * @typeParam V - Values of the given record
 */
export type generateValueFn<R extends Record<K, V>, K extends RecordKey, V> = (
  record: R,
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

interface AddPropertyOperation<R extends Record<K, V>, K extends RecordKey, V>
  extends Operation {
  type: 'addProperty';
  key: K;
  generateValue: generateValueFn<R, K, V>;
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

function isAddPropertyOperation<R extends Record<K, V>, K extends RecordKey, V>(
  operation: Operation
): operation is AddPropertyOperation<R, K, V> {
  return operation.type === 'addProperty';
}

/**
 * Ape — Array Processing Engine
 *
 * @public
 */
export class Ape<R extends Record<RecordKey, unknown>> {
  private records: R[];
  private operations: Operation[] = [];
  private indices: Record<string, Index> = {};

  /**
   * ```typescript
   * const ape = new Ape([{ a: 'val 1' }, { a: 'val 2' }]);
   * ape.process();
   * // → [{ a: 'val 1' }, { a: 'val 2' }]
   * ```
   */
  public constructor(records: R[]) {
    this.records = records;
  }

  /**
   * Adds a map operation; when processed the given function will be called
   * for each record.
   *
   * ```typescript
   * const ape = new Ape([{ a: 'val 1' }, { a: 'val 2' }]);
   * ape.map(record => ({ a: record.a.toUpperCase() }));
   * ape.process();
   * // → [{ a: 'VAL 1' }, { a: 'VAL 2' }]
   * ```
   */
  public map(mapFn: mapFn<R>): Ape<R> {
    const operation = { type: 'map', map: mapFn } as MapOperation<R>;
    return this.addOperation(operation);
  }

  /**
   * Adds a map value operation; when processed the given function will be
   * called with the value of the given key for each record.
   *
   * ```typescript
   * const ape = new Ape([{ a: 'val 1' }, { a: 'val 2' }]);
   * ape.mapValue('a', value => value.toUpperCase());
   * ape.process();
   * // → [{ a: 'VAL 1' }, { a: 'VAL 2' }]
   * ```
   */
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

  /**
   * Adds a add property operation; when processed the given function will be
   * used to add a new property to each record with the given key.
   *
   * ```typescript
   * const ape = new Ape([{ a: 'val 1' }, { a: 'val 2' }]);
   * ape.addProperty('b', record => record.a.toUpperCase());
   * ape.process();
   * // → [{ a: 'val 1', b: 'VAL 1' }, { a: 'val 2', b: 'VAL 2 }]
   * ```
   */
  public addProperty<K extends RecordKey>(
    key: K,
    generateValue: generateValueFn<R, K, R[K]>
  ): Ape<R> {
    const operation: AddPropertyOperation<R, K, R[K]> = {
      type: 'addProperty',
      key,
      generateValue,
    };
    return this.addOperation(operation);
  }

  /**
   * Adds a rename key operation; when processed the given key will be renamed
   * in each record.
   *
   * ```typescript
   * const ape = new Ape([{ a: 'val 1' }, { a: 'val 2' }]);
   * ape.renameKey('a', 'b');
   * ape.process();
   * // → [{ b: 'val 1' }, { b: 'val 2' }]
   * ```
   */
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

  /**
   * Adds a merge by index operation; when processed each record will be merged
   * with the record in the given {@link Ape} instance that matches the given
   * index.
   *
   * The given `keys` can either be a [[RecordKey]] or an array of [[RecordKey]]
   *
   * The given [[Ape]] instance must have an [[Ape.createIndex | index
   * created]] before processing the merge.
   *
   * ```typescript
   * const ape1 = new Ape([{ id: 1, a: 'val 1' }, { id: 2, a: 'val 2' }]);
   * const ape2 = new Ape([{ id: 1, b: 'foo 1' }, { id: 2, b: 'foo 2' }]);
   * ape2.createIndex('id');
   * ape1.mergeByIndex('id');
   * ape1.process();
   * // → [{ id: 1, a: 'val 1', b: 'foo 1' }, { id: 2, a: 'val 2', b: 'foo 2' }]
   * ```
   */
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

  /**
   * Immediately create an index of the records by the given key(s). The data
   * is [[Ape.process | processed]] before the index is created.
   *
   * The given `keys` can either be a [[RecordKey]] or an array of [[RecordKey]]
   *
   * ```typescript
   * const ape = new Ape([{ id: 1, a: 'val 1' }, { id: 2, a: 'val 2' }]);
   * ape.createIndex('id');
   * ape.findByIndex({ id: 1 }); // → { id: 1, a: 'val 1' }
   * ```
   */
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

  /**
   * Returns a record that matches the given query. An index for the keys used
   * in the query needs to be created first.
   *
   * ```typescript
   * const ape = new Ape([{ id: 1, a: 'val 1' }, { id: 2, a: 'val 2' }]);
   * ape.createIndex('id');
   * // Naive find:
   * ape.process().find(r => r.id === 1); // → { id: 1, a: 'val 1' }
   * // Indexed find:
   * ape.findByIndex({ id: 1 }); // → { id: 1, a: 'val 1' }
   * ```
   *
   * The naive find example as an upper bound of `O(n)`, while the indexed find
   * has an upper bound of `O(1)`. The performance is useful, for example, when
   * [[Ape.mergeByIndex | merging two arrays of records]].
   */
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

  /**
   * Processes the data in this `Ape` instance by executing all queued
   * operations and returning the result.
   */
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
          } else if (isAddPropertyOperation(operation)) {
            newRecord = {
              ...newRecord,
              [operation.key]: operation.generateValue(
                newRecord,
                operation.key,
                index,
                this.records
              ),
            };
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
