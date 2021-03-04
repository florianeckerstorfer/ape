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
      ape.mapKey('foo', (key) => key.toUpperCase());

      expect(ape.process()).toEqual([{ FOO: 'bar' }]);
    });
  });
});
