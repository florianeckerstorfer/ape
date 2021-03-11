import ape from '../index';

describe('ape', () => {
  let data: Array<{ foo: string }>;

  beforeEach(() => {
    data = [{ foo: '123' }, { foo: '456' }];
  });

  describe('data', () => {
    it('should return data', () => {
      const newData = ape(data).data;
      expect(newData).toBe(data);
    });
  });

  describe('map()', () => {
    it('should map records', () => {
      const mapFn = (r) => ({ ...r, foo: parseInt(r.foo, 10) });
      const newData = ape(data).map(mapFn).data;

      expect(newData).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
    });
  });

  describe('mapValues()', () => {
    it('should map values', () => {
      const mapValueFn = (v: string) => parseInt(v, 10);
      const newData = ape(data).mapValue('foo', mapValueFn).data;

      expect(newData).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
    });
  });

  describe('rename()', () => {
    it('should rename keys in records', () => {
      const newData = ape(data).rename('foo', 'bar').data;
      newData.map((r) => r.bar);

      expect(newData).toStrictEqual([{ bar: '123' }, { bar: '456' }]);
    });

    it('should not modify original data', () => {
      const newData = ape(data).rename('foo', 'bar').data;
      newData.map((r) => r.bar);

      expect(data).toStrictEqual([{ foo: '123' }, { foo: '456' }]);
    });
  });

  describe('createIndex()', () => {
    it('should create index with single key', () => {
      const newApe = ape(data).createIndex('foo');

      expect(newApe.findByIndex({ foo: '123' })).toStrictEqual({
        foo: '123',
      });
    });

    it('should create index with multiple keys', () => {
      const thisData = [
        { foo: '123', bar: '456' },
        { foo: '456', bar: '456' },
      ];
      const newApe = ape(thisData).createIndex(['foo', 'bar']);

      expect(newApe.findByIndex({ foo: '123', bar: '456' })).toStrictEqual({
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
      const newApe = ape(thisData).createIndex(['foo', 'bar']);

      expect(() => newApe.findByIndex({ foo: '123' })).toThrowError(
        'No index exists for "foo"'
      );
    });
  });
});
