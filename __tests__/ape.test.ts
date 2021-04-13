import { ape } from '../src/ape';

describe('ape()', () => {
  type Record = { foo: string };
  let data: Record[];

  beforeEach(() => {
    data = [{ foo: '123' }, { foo: '456' }];
  });

  it('should return data', () => {
    expect(ape(data).data).toStrictEqual(data);
  });

  describe('map()', () => {
    it('should map records', () => {
      const mapFn = (r: Record) => ({ ...r, foo: 'new', bar: 1 });
      const result = ape(data).map(mapFn);

      expect(result.data).toStrictEqual([
        { foo: 'new', bar: 1 },
        { foo: 'new', bar: 1 },
      ]);
    });

    it('should receive index in map function', () => {
      const mapFn = (r: Record, index: number) => ({ ...r, foo: index });
      const result = ape(data).map(mapFn);

      expect(result.data).toStrictEqual([{ foo: 0 }, { foo: 1 }]);
    });

    it('should receive data in map function', () => {
      const mapFn = (r: Record, _: number, data: Record[]) => ({
        ...r,
        foo: data.length,
      });
      const result = ape(data).map(mapFn);

      expect(result.data).toStrictEqual([{ foo: 2 }, { foo: 2 }]);
    });
  });

  describe('mapValues()', () => {
    it('should map values', () => {
      const mapValueFn = (v: string) => parseInt(v, 10);
      const result = ape(data).mapValue('foo', mapValueFn);

      expect(result.data).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
    });

    it('should receive key in mapValue function', () => {
      const mapValueFn = (_: string, key: string | number) => key;
      const result = ape(data).mapValue('foo', mapValueFn);

      expect(result.data).toStrictEqual([{ foo: 'foo' }, { foo: 'foo' }]);
    });

    it('should receive index in mapValue function', () => {
      const mapValueFn = (_v: string, _k: string | number, index: number) =>
        index;
      const result = ape(data).mapValue('foo', mapValueFn);

      expect(result.data).toStrictEqual([{ foo: 0 }, { foo: 1 }]);
    });

    it('should receive data in mapValue function', () => {
      const mapValueFn = (
        _value: string,
        _key: string | number,
        _index: number,
        data: Array<unknown>
      ) => data.length;
      const result = ape(data).mapValue('foo', mapValueFn);

      expect(result.data).toStrictEqual([{ foo: 2 }, { foo: 2 }]);
    });
  });

  describe('renameKey()', () => {
    it('should rename keys in records', () => {
      const result = ape(data).renameKey('foo', 'bar');

      expect(result.data).toStrictEqual([{ bar: '123' }, { bar: '456' }]);
    });
  });

  describe('createIndex()', () => {
    it('should create index with single key', () => {
      const result = ape(data).createIndex('foo').findByIndex({ foo: '123' });

      expect(result).toStrictEqual({
        foo: '123',
      });
    });

    it('should create index with multiple keys', () => {
      const thisData = [
        { foo: '123', bar: '456' },
        { foo: '456', bar: '456' },
      ];
      const result = ape(thisData)
        .createIndex(['foo', 'bar'])
        .findByIndex({ foo: '123', bar: '456' });

      expect(result).toStrictEqual({
        foo: '123',
        bar: '456',
      });
    });
  });

  describe('findByIndex()', () => {
    it('should throw error if no index exists for given query', () => {
      const thisData = [
        { foo: '123', bar: '456' },
        { foo: '456', bar: '456' },
      ];
      const result = ape(thisData).createIndex(['foo', 'bar']);

      expect(() => result.findByIndex({ foo: '123' })).toThrowError(
        'No index exists for "foo"'
      );
    });

    it('should return `undefined` if no record with given index exists', () => {
      const result = ape(data).createIndex('foo').findByIndex({ foo: 'xxx' });

      expect(result).toBeUndefined();
    });
  });

  describe('mergeByIndex()', () => {
    const data1 = [
      { foo: '123', qoo: 'aaa' },
      { foo: '456', qoo: 'bbb' },
    ];
    const data2 = [
      { foo: '123', bar: '123' },
      { foo: '456', bar: '456' },
    ];

    const expectedResult = [
      { foo: '123', qoo: 'aaa', bar: '123' },
      { foo: '456', qoo: 'bbb', bar: '456' },
    ];

    it('should merge records with records of another Ape instance', () => {
      const result1 = ape(data1).mergeByIndex('foo', data2);

      expect(result1.data).toStrictEqual(expectedResult);
    });

    it('should accept keys as array', () => {
      const result1 = ape(data1).mergeByIndex(['foo'], data2);

      expect(result1.data).toStrictEqual(expectedResult);
    });

    it('should accept key as string', () => {
      const result1 = ape(data1).mergeByIndex('foo', data2);

      expect(result1.data).toStrictEqual(expectedResult);
    });
  });
});
