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

### Types and Naming

Before we look at the methods exposed by `ape` let's talk quickly about types. `ape` is written in TypeScript and typed in a way that you will receive a typed array back. You won't benefit if you use the JavaScript version of `ape`, but we will also use these terms in the docs to explain the methods:

- **Data:** This is the dataset you pass into `ape` and that all methods will operate on.
- `Record`: A single record of the given dataset, or in less fancy terms: an element in the data array.
- `Record[]`: The type of **data**.
- `Key`: Each record is an object with keys and values. When we talk about `Key` we mean a key in a `Record`. (For my TypeScript peeps: `string | number | symbol`)
- `Value`: The value corresponding to a `key`. Can be anything, even another array or object.

### `map`: Maps a record

It's just `Array.map()`, but you can chain it with other `ape` methods.

`map((record: Record, index: number, data: Record[]) => mappedRecord)`

Example:

```javascript
const data = [{ foo: '123' }, { foo: '456' }];
ape(data).map((record, index) => ({ ...record, index })).data;
// → [{ foo: '123', index: 0}, { foo: '456', index: 1 }]
```

### `mapValue`: Maps a single value

Takes a key and a function and calls this function with the value corresponding with the key for each record.

`mapValue(key: Key, (value: Value, key: Key, index: number, data: Record[]) => mappedValue)`

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

`rename(key: Key, newKey: Key)`

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
