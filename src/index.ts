type RecordKey = string | number | symbol;

type mapFn<R, NR> = (record: R) => NR;

type mapValueFn<R extends Record<K, V>, K extends RecordKey, V, NV> = (
  value: R[K]
) => NV;

function map<R extends Record<K, V>, K extends RecordKey, V>(data: R[]) {
  return <NR extends Record<NK, NV>, NK extends RecordKey, NV>(
    mapFn: mapFn<R, NR>
  ) => ape(data.map(mapFn));
}

function mapValue<R extends Record<K, V>, K extends RecordKey, V>(data: R[]) {
  return <NV>(key: K, mapValueFn: mapValueFn<R, K, V, NV>) =>
    ape(data.map((r) => ({ ...r, [key]: mapValueFn(r[key]) })));
}

function rename<R extends Record<K, V>, K extends RecordKey, V>(data: R[]) {
  return <NK extends RecordKey>(key: K, newKey: NK) =>
    ape(
      data.map((record: R): Omit<R, K> & Record<NK, R[K]> => {
        const newValue = { [newKey]: record[key] } as Record<NK, R[K]>;
        delete record[key];
        return { ...record, ...newValue };
      })
    );
}

export default function ape<R extends Record<K, V>, K extends RecordKey, V>(
  data: R[]
) {
  return {
    data,
    map: map(data),
    mapValue: mapValue(data),
    rename: rename(data),
  };
}
