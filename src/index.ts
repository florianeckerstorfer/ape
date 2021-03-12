type RecordKey = string | number | symbol;

type Index = {
  keys: string;
  index: { [key: string]: number };
};

type mapFn<R, NR> = (record: R, index: number, data: R[]) => NR;

type mapValueFn<R extends Record<K, V>, K extends RecordKey, V, NV> = (
  value: R[K],
  key: K,
  index: number,
  data: R[]
) => NV;

function map<R extends Record<K, V>, K extends RecordKey, V>(data: R[]) {
  return <NR extends Record<NK, NV>, NK extends RecordKey, NV>(
    mapFn: mapFn<R, NR>
  ) => ape(data.map(mapFn));
}

function mapValue<R extends Record<K, V>, K extends RecordKey, V>(data: R[]) {
  return <NV>(key: K, mapValueFn: mapValueFn<R, K, V, NV>) =>
    ape(
      data.map((r, index) => ({
        ...r,
        [key]: mapValueFn(r[key], key, index, data),
      }))
    );
}

function rename<R extends Record<K, V>, K extends RecordKey, V>(data: R[]) {
  return <NK extends RecordKey>(key: K, newKey: NK) =>
    ape(
      data.map((record: R): Omit<R, K> & Record<NK, R[K]> => {
        const newValue = { [newKey]: record[key] } as Record<NK, R[K]>;
        const omittedValue = { ...record };
        delete omittedValue[key];
        return { ...omittedValue, ...newValue };
      })
    );
}

function createIndex<R extends Record<K, V>, K extends RecordKey, V>(
  data: R[]
) {
  return (keys: K | K[]) => {
    const keyArr = Array.isArray(keys) ? keys : [keys];
    const index: Index = {
      keys: keyArr.join('_'),
      index: {},
    };
    data.forEach((record, dataIndex) => {
      const indexKey = keyArr.map((key) => record[key]).join('_');
      index.index[indexKey] = dataIndex;
    });
    return ape(data, index);
  };
}

function findByIndex<R extends Record<K, V>, K extends RecordKey, V>(
  data: R[],
  index?: Index
) {
  return (query: Partial<R>): R | undefined => {
    const keyString = Object.keys(query).join('_');
    if (!index || index.keys !== keyString) {
      throw new Error(`No index exists for "${keyString}"`);
    }
    const queryString = Object.values(query).join('_');
    return data[index.index[queryString]];
  };
}

type Ape<R extends Record<K, V>, K extends RecordKey, V> = {
  data: R[];
  map: ReturnType<typeof map>;
  mapValue: ReturnType<typeof mapValue>;
  rename: ReturnType<typeof rename>;
  createIndex: ReturnType<typeof createIndex>;
  findByIndex: ReturnType<typeof findByIndex>;
};

export default function ape<R extends Record<K, V>, K extends RecordKey, V>(
  data: R[],
  index?: Index
): Ape<R, K, V> {
  return {
    data,
    map: map(data),
    mapValue: mapValue(data),
    rename: rename(data),
    createIndex: createIndex(data),
    findByIndex: findByIndex(data, index),
  };
}
