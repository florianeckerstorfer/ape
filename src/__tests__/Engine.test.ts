import Engine from '../Engine';

describe('Engine', () => {
  describe('constructor()', () => {
    it('should create Engine object', () => {
      expect(new Engine([])).toBeInstanceOf(Engine);
    });
  });

  describe('.process()', () => {
    it('should return original data if no operations defined', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);

      expect(ape.process()).toEqual(data);
    });

    it('should process map operations and return result', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);
      ape.map(() => ({ another: 'value' }));

      expect(ape.process()).toEqual([{ another: 'value' }]);
    });

    it('should process multiple map operations and return result', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);
      ape
        .map((item) => ({ ...item, another: 'value' }))
        .map((item) => ({ ...item, third: 'charm' }));

      expect(ape.process()).toEqual([
        { foo: 'bar', another: 'value', third: 'charm' },
      ]);
    });

    it('should process mapValue operations and return result', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);
      ape.mapValue('foo', (value) => value.toUpperCase());

      expect(ape.process()).toEqual([{ foo: 'BAR' }]);
    });

    it('should process multiple mapValue operations and return result', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);
      ape
        .mapValue('foo', (value) => value.toUpperCase())
        .mapValue('foo', (value) => value.toLowerCase());

      expect(ape.process()).toEqual([{ foo: 'bar' }]);
    });

    it('should process mapKey operations and return result', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);
      ape.renameKey('foo', 'FOO');

      expect(ape.process()).toEqual([{ FOO: 'bar' }]);
    });

    it('should process multiple operations', () => {
      const data = [{ foo: 'bar' }];
      const ape = new Engine(data);
      ape
        .renameKey('foo', 'foobar')
        .mapValue('foobar', (value: string) => value.toUpperCase());

      expect(ape.process()).toEqual([{ foobar: 'BAR' }]);
    });

    it('should create index with single key and search by index', () => {
      const data = [
        { foo: '123', bar: 0 },
        { foo: '456', bar: 1 },
        { foo: '789', bar: 2 },
      ];
      const ape = new Engine(data);
      ape.createIndex('foo');

      const result = ape.findByIndex({ foo: '456' });
      expect(result.bar).toBe(1);
    });

    it('should return `undefined` if given query does not exist in index', () => {
      const data = [
        { foo: '123', bar: 0 },
        { foo: '456', bar: 1 },
        { foo: '789', bar: 2 },
      ];
      const ape = new Engine(data);
      ape.createIndex('foo');

      expect(ape.findByIndex({ foo: '000' })).toBeUndefined();
    });

    it('should throw error if given index does not exist', () => {
      const ape = new Engine([]);
      expect(() => ape.findByIndex({ foo: 'abc' })).toThrowError(
        'Ape Engine does not have index: foo'
      );
    });

    it('should create index with multiple keys and search by index', () => {
      const data = [
        { foo: '123', goo: 'abc', bar: 0 },
        { foo: '456', goo: 'def', bar: 1 },
        { foo: '789', goo: 'ghi', bar: 2 },
      ];
      const ape = new Engine(data);
      ape.createIndex(['foo', 'goo']);

      const result = ape.findByIndex({ foo: '456', goo: 'def' });
      expect(result.bar).toBe(1);
    });

    it('should process operations before creating index', () => {
      const data = [
        { foo: '123', bar: 0 },
        { foo: '456', bar: 1 },
        { foo: '789', bar: 2 },
      ];
      const ape = new Engine(data);
      ape.renameKey('foo', 'FOO').createIndex('FOO');

      const result = ape.findByIndex({ FOO: '456' });
      expect(result.bar).toBe(1);
    });

    it('should merge Engine with another Engine by an index', () => {
      const data1 = [
        { foo: '123', bar: 0 },
        { foo: '456', bar: 1 },
      ];
      const data2 = [
        { foo: '123', qoo: 'A' },
        { foo: '456', qoo: 'B' },
      ];
      const ape1 = new Engine(data1);
      const ape2 = new Engine(data2);
      ape1.mergeByIndex(['foo'], ape2);
      ape2.createIndex('foo');

      const result = ape1.process();
      expect(result[0]).toEqual({ foo: '123', bar: 0, qoo: 'A' });
    });
  });
});
