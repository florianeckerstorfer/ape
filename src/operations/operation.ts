type OperationType = 'map' | 'mapValue' | 'mapKey' | 'mergeByIndex';

export interface Operation {
  type: OperationType;
}
