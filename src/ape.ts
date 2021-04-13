type ApeRecordKey = string | number;

type ApeRecord<K extends ApeRecordKey, V> = Record<K, V>;

type ApeData<K extends ApeRecordKey, V> = ApeRecord<K, V>[];

type mapFn<
  Key extends ApeRecordKey,
  Value,
  NewKey extends ApeRecordKey,
  NewValue
> = (
  record: ApeRecord<Key, Value>,
  index: number,
  data: ApeData<Key, Value>
) => ApeRecord<NewKey, NewValue>;

type mapValueFn<Key extends ApeRecordKey, Value, NewValue> = (
  value: Value,
  key: Key,
  index: number,
  data: ApeData<Key, Value>
) => NewValue;

type Index = Record<string, number>;

type ApeMeta = {
  indices: Record<string, Index>;
};

export function ape<Key extends ApeRecordKey, Value>(
  data: ApeData<Key, Value>,
  meta: ApeMeta = { indices: {} }
) {
  function map<NewKey extends ApeRecordKey, NewValue>(
    mapFn: mapFn<Key, Value, NewKey, NewValue>
  ) {
    return ape(data.map(mapFn), meta);
  }

  function mapValue<NewValue>(
    key: Key,
    mapValueFn: mapValueFn<Key, Value, NewValue>
  ) {
    return ape(
      data.map(
        (record, index): ApeRecord<Key, NewValue> => ({
          ...record,
          [key]: mapValueFn(record[key], key, index, data),
        })
      ),
      meta
    );
  }

  function renameKey<NewKey extends ApeRecordKey>(key: Key, newKey: NewKey) {
    return ape(
      data.map(
        (record): ApeRecord<NewKey, Value> => {
          const recordCopy = { ...record, [newKey]: record[key] };
          delete recordCopy[key];
          return (recordCopy as unknown) as ApeRecord<NewKey, Value>;
        }
      ),
      meta
    );
  }

  function createIndex(keys: Key | Key[]) {
    const keysArr = Array.isArray(keys) ? keys : [keys];
    const newIndex: Index = {};
    data.forEach((record, index) => {
      const recordKey = keysArr.map((key) => record[key]).join('_');
      newIndex[recordKey] = index;
    });
    return ape(data, {
      ...meta,
      indices: { ...meta.indices, [keysArr.join('_')]: newIndex },
    });
  }

  function findByIndex(
    query: Partial<ApeRecord<ApeRecordKey, unknown>>
  ): ApeRecord<Key, Value> | undefined {
    const keysStr = Object.keys(query).join('_');
    const valuesStr = Object.values(query).join('_');
    if (!meta.indices[keysStr]) {
      throw new Error(`No index exists for "${keysStr}"`);
    }
    return data[meta.indices[keysStr][valuesStr]];
  }

  function mergeByIndex(
    keys: Key | Key[],
    mergeData: ApeData<ApeRecordKey, unknown>
  ) {
    const keysArr = Array.isArray(keys) ? keys : [keys];
    const mergeApe = ape(mergeData).createIndex(keys);
    return ape(
      data.map((record) => {
        const query: Record<ApeRecordKey, unknown> = {};
        keysArr.forEach((key) => {
          query[key] = record[key];
        });
        return { ...record, ...mergeApe.findByIndex(query) };
      }),
      meta
    );
  }

  return {
    data,
    map,
    mapValue,
    renameKey,
    createIndex,
    findByIndex,
    mergeByIndex,
  };
}
