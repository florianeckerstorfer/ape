import Ape from '../index';
import Engine from '../Engine';

describe('Ape', () => {
  it('should export Engine', () => {
    expect(Ape).toBe(Engine);
  });
});
