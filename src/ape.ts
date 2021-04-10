/**
 * Key of a record.
 * @public
 */
export type ApeRecordKey = string | number;

export type ApeRecord = Record<ApeRecordKey, unknown>;

export type ApeData = ApeRecord[];

/**
 * Function that maps a record.
 *
 * @param record - Record to be mapped
 * @param index - Index of the record in the array
 * @param data - Array of records
 */
export type mapFn = (
  record: ApeRecord,
  index: number,
  data: ApeData
) => ApeRecord;

/**
 * Function that maps a single value of a record.
 *
 * @param value - Value to be mapped
 * @param key - Key of the value in the record
 * @param index - Index of the record in the array
 * @param data - Array of records
 */
export type mapValueFn = (
  value: unknown,
  key: ApeRecordKey,
  index: number,
  data: ApeData
) => unknown;

/**
 * Function that takes a record, key, index and the whole array and returns the
 * value for the given key.
 *
 * @param record - Record the value will be added to
 * @param key - Key that the value will be assigned to
 * @param index - Index of the record in the array
 * @param records - Array of records
 */
export type generateValueFn = (
  record: ApeRecord,
  key: ApeRecordKey,
  index: number,
  records: ApeData
) => unknown;

type Index = Record<string, number>;

type ApeMeta = {
  indices: Record<string, Index>;
};

export function ape(data: ApeData, meta: ApeMeta = { indices: {} }) {
  function map(mapFn: mapFn) {
    return ape(data.map(mapFn), meta);
  }

  function mapValue(key: ApeRecordKey, mapValueFn: mapValueFn) {
    return ape(
      data.map((record, index) => ({
        ...record,
        [key]: mapValueFn(record[key], key, index, data),
      })),
      meta
    );
  }

  function renameKey(key: ApeRecordKey, newKey: ApeRecordKey) {
    return ape(
      data.map((record) => {
        const recordCopy = { ...record, [newKey]: record[key] };
        delete recordCopy[key];
        return recordCopy;
      }),
      meta
    );
  }

  function createIndex(keys: ApeRecordKey | ApeRecordKey[]) {
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

  function findByIndex(query: Partial<ApeRecord>): ApeRecord | undefined {
    const keysStr = Object.keys(query).join('_');
    const valuesStr = Object.values(query).join('_');
    if (!meta.indices[keysStr]) {
      throw new Error(`No index exists for "${keysStr}"`);
    }
    return data[meta.indices[keysStr][valuesStr]];
  }

  function mergeByIndex(
    keys: ApeRecordKey | ApeRecordKey[],
    mergeData: ApeData
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
