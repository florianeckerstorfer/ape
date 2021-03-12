# `ape`: Array Processing Engine

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Code of conduct](#code-of-conduct)
4. [Contributing](#contributing)
5. [Change log](#change-log)
6. [License](#license)

## Installation

You can install `ape` with NPM or Yarn:

```shell
npm install --save @fec/ape
yarn add @fec/ape
```

## Usage

`ape` does only have a single export, the titular `ape` function:

```javascript
import ape from 'ape';

const engine = ape(myDataArr);
const data = engine.data;
```

### `map`: Maps a record

It's just `Array.map()`, but you can chain it with other `ape` methods.

`map((record, index, data) => mappedRecord)`

Example:

```javascript
const data = [{ foo: '123' }, { foo: '456' }];
ape(data).map((record, index) => ({ ...record, index })).data;
// → [{ foo: '123', index: 0}, { foo: '456', index: 1 }]
```

### `mapValue`: Maps a single value

Takes a key and a function and calls this function with the value corresponding with the key for each record.

`mapValue(key, (value, key, index, data) => mappedValue)`

Example:

```javascript
const data = [
  { foo: '123', bar: 'aaa' },
  { foo: '456', bar: 'bbb' },
];
ape(data).mapValue('bar', (value) => value.toUpperCase()).data;
// → [{ foo: '123', bar: 'AAA' }, { foo: '456', bar: 'BBB' }]
```

### `rename`: Renames a key

Renames a key in each record.

`rename(key, newKey)`

Examples:

```javascript
const data = [{ foo: '123' }, { foo: '456' }];
ape(data).rename('foo', 'bar').data;
// → [{ bar: '123' }, { bar: '456' }]
```

### `createIndex`

### `findByIndex`

## Code of conduct

## Contributing

## Change log

## License
