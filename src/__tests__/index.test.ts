import ape from '../index';

describe('ape', () => {
  const data = [{ foo: '123' }, { foo: '456' }];

  it('should return data', () => {
    const newData = ape(data).data;
    expect(newData).toBe(data);
  });

  it('should map records', () => {
    const mapFn = (r) => ({ ...r, foo: parseInt(r.foo, 10) });
    const newData = ape(data).map(mapFn).data;

    expect(newData).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
  });

  it('should map values', () => {
    const mapValueFn = (v) => parseInt(v, 10);
    const newData = ape(data).mapValue('foo', mapValueFn).data;

    expect(newData).toStrictEqual([{ foo: 123 }, { foo: 456 }]);
  });

  it('should rename keys in records', () => {
    const newData = ape(data).rename('foo', 'bar').data;
    newData.map((r) => r.bar);

    expect(newData).toStrictEqual([{ bar: '123' }, { bar: '456' }]);
  });
});
