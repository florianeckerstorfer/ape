type RecordKey = string | number;

type mapFn<R> = (record: R) => Record<RecordKey, unknown>;

type mapValueFn<R extends Record<K, V>, K extends RecordKey, V> = (
  value: R[K],
  key: K,
  index: number
) => unknown;

enum OperationType {
  Map,
  MapValue,
  RenameKey,
}

interface Operation {
  type: OperationType;
}

interface MapOperation<R> extends Operation {
  type: OperationType.Map;
  mapFn: mapFn<R>;
}

interface MapValueOperation<R extends Record<K, V>, K extends RecordKey, V>
  extends Operation {
  type: OperationType.MapValue;
  key: RecordKey;
  mapValueFn: mapValueFn<R, K, V>;
}

interface RenameKeyOperation<K extends RecordKey, NK extends RecordKey>
  extends Operation {
  type: OperationType.RenameKey;
  key: K;
  newKey: NK;
}

function isMapOperation<R>(operation: Operation): operation is MapOperation<R> {
  return operation.type === OperationType.Map;
}

function isMapValueOperation<R extends Record<K, V>, K extends RecordKey, V>(
  operation: Operation
): operation is MapValueOperation<R, K, V> {
  return operation.type === OperationType.MapValue;
}

function isRenameKeyOperation<K, NK>(
  operation: Operation
): operation is RenameKeyOperation<K, NK> {
  return operation.type === OperationType.RenameKey;
}

class Ape<
  R extends Record<K, V>,
  K extends RecordKey,
  V,
  PR extends Record<PK, PV>,
  PK extends RecordKey,
  PV
> {
  private operations: Operation[] = [];
  private data: R[] = [];

  public constructor(data: R[]) {
    this.data = data;
  }

  private addOperation(operation: Operation): Ape<R, K, V, PR, PK, PV> {
    this.operations.push(operation);
    return this;
  }

  public map(mapFn: mapFn<R>): Ape<R, K, V, PR, PK, PV> {
    const operation: MapOperation<R> = { mapFn, type: OperationType.Map };
    return this.addOperation(operation);
  }

  public mapValue(
    key: K,
    mapValueFn: mapValueFn<R, K, V>
  ): Ape<R, K, V, PR, PK, PV> {
    const operation: MapValueOperation<R, K, V> = {
      key,
      mapValueFn,
      type: OperationType.MapValue,
    };
    return this.addOperation(operation);
  }

  public renameKey<NK extends RecordKey>(
    key: K,
    newKey: NK
  ): Ape<R, K, V, PR, PK, PV> {
    const operation: RenameKeyOperation<K, NK> = {
      key,
      newKey,
      type: OperationType.RenameKey,
    };
    return this.addOperation(operation);
  }

  public process(): PR[] {
    let newData: Array<Record<RecordKey, unknown>> = this.data;
    this.operations.forEach((operation: Operation) => {
      if (isMapOperation(operation)) {
        newData = newData.map(operation.mapFn);
      } else if (isMapValueOperation(operation)) {
        newData = newData.map((record, index) => ({
          ...record,
          [operation.key]: operation.mapValueFn(
            record[operation.key],
            operation.key,
            index
          ),
        }));
      } else if (isRenameKeyOperation(operation)) {
        newData = newData.map((record) => {
          const value = record[operation.key];
          delete record[operation.key];
          return { ...record, [operation.newKey]: value };
        });
      }
    });
    return newData as PR[];
  }
}

export default Ape;
