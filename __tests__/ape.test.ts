import Ape from '../src/ape';

describe('Ape', () => {
  type Record = { foo: string };
  let data: Record[];

  beforeEach(() => {
    data = [{ foo: '123' }, { foo: '456' }];
  });

  describe('process()', () => {
    it('should return data', () => {
      const result = new Ape(data).process();
      expect(result).toStrictEqual(data);
    });
  });

  describe('map()', () => {
    it('should map records', () => {
      const mapFn = (r: Record) => ({ ...r, foo: parseInt(r.foo, 10) });
      const result = new Ape(data).map(mapFn).process();

      expect(result).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
    });

    it('should receive index in map function', () => {
      const mapFn = (r: Record, index: number) => ({ ...r, foo: index });
      const result = new Ape(data).map(mapFn).process();

      expect(result).toStrictEqual([{ foo: 0 }, { foo: 1 }]);
    });

    it('should receive data in map function', () => {
      const mapFn = (r: Record, _: number, data: Record[]) => ({
        ...r,
        foo: data.length,
      });
      const result = new Ape(data).map(mapFn).process();

      expect(result).toStrictEqual([{ foo: 2 }, { foo: 2 }]);
    });
  });

  describe('mapValues()', () => {
    it('should map values', () => {
      const mapValueFn = (v: string) => parseInt(v, 10);
      const result = new Ape(data).mapValue('foo', mapValueFn).process();

      expect(result).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
    });

    it('should receive key in mapValue function', () => {
      const mapValueFn = (_: string, key: string | number | symbol) => key;
      const result = new Ape(data).mapValue('foo', mapValueFn).process();

      expect(result).toStrictEqual([{ foo: 'foo' }, { foo: 'foo' }]);
    });

    it('should receive index in mapValue function', () => {
      const mapValueFn = (
        _value: string,
        _key: string | number | symbol,
        index: number
      ) => index;
      const result = new Ape(data).mapValue('foo', mapValueFn).process();

      expect(result).toStrictEqual([{ foo: 0 }, { foo: 1 }]);
    });

    it('should receive data in mapValue function', () => {
      const mapValueFn = (
        _value: string,
        _key: string | number | symbol,
        _index: number,
        data: Array<unknown>
      ) => data.length;
      const result = new Ape(data).mapValue('foo', mapValueFn).process();

      expect(result).toStrictEqual([{ foo: 2 }, { foo: 2 }]);
    });
  });

  describe('rename()', () => {
    it('should rename keys in records', () => {
      const result = new Ape(data).renameKey('foo', 'bar').process();

      expect(result).toStrictEqual([{ bar: '123' }, { bar: '456' }]);
    });

    it('should not modify original data', () => {
      const result = new Ape(data).renameKey('foo', 'bar').process();
      result.map((r) => r.bar);

      expect(data).toStrictEqual([{ foo: '123' }, { foo: '456' }]);
    });
  });

  describe('createIndex()', () => {
    it('should create index with single key', () => {
      const ape = new Ape(data).createIndex('foo');

      expect(ape.findByIndex({ foo: '123' })).toStrictEqual({
        foo: '123',
      });
    });

    it('should create index with multiple keys', () => {
      const thisData = [
        { foo: '123', bar: '456' },
        { foo: '456', bar: '456' },
      ];
      const ape = new Ape(thisData).createIndex(['foo', 'bar']);

      expect(ape.findByIndex({ foo: '123', bar: '456' })).toStrictEqual({
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
      const ape = new Ape(thisData).createIndex(['foo', 'bar']);

      expect(() => ape.findByIndex({ foo: '123' })).toThrowError(
        'No index exists for "foo"'
      );
    });

    it('should return `undefined` if no record with given index exists', () => {
      const ape = new Ape(data).createIndex('foo');

      expect(ape.findByIndex({ foo: 'xxx' })).toBeUndefined();
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
      const ape2 = new Ape(data2).createIndex('foo');
      const ape = new Ape(data1).mergeByIndex('foo', ape2);

      expect(ape.process()).toStrictEqual(expectedResult);
    });

    it('should accept keys as array', () => {
      const ape2 = new Ape(data2).createIndex('foo');
      const ape = new Ape(data1).mergeByIndex(['foo'], ape2);

      expect(ape.process()).toStrictEqual(expectedResult);
    });

    it('should accept key as string', () => {
      const ape2 = new Ape(data2).createIndex('foo');
      const ape = new Ape(data1).mergeByIndex('foo', ape2);

      expect(ape.process()).toStrictEqual(expectedResult);
    });
  });
});
