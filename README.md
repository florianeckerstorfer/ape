# Ape

Ape is an _array processing engine_. It takes an array of records and gives you a convenient interface to operate on it. Operations are processed in batch.

Made by 👨‍💻 [Florian Eckerstorfer](https://florian.ec) in 🎡 Vienna, Europe.

![](assets/readme-monkeys.svg)

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API documentation](#api-documentation)
4. [Code of conduct](#code-of-conduct)
5. [Contributing](#contributing)
6. [Change log](#change-log)
7. [License](#license)

## Installation

You can install `ape` with NPM or Yarn:

```shell
npm install --save @fec/ape
yarn add @fec/ape
```

## Usage

`ape` does only have a single export, the titular `ape` function. It takes an array of records and returns an object with various functions to process the array.

```javascript
import { ape } from 'ape';

const data = ape([{ a: 'val 1' }, { a: 'val 2' }])
  .map((record) => ({ a: record.a.toUpperCase() }))
  .renameKey('a', 'b').data;
// → [{ b: 'VAL 1' }, { b: 'VAL 2' }]
```

## API documentation

In the following API documentation we will be using the following types:

- `ApeRecordKey`: alias for `string | number`, used as key in `ApeRecord`
- `Value`: value used in `ApeRecord`
- `ApeRecord`: object with key-value pairs
- `ApeData`: array of `ApeRecord`

### Map

```typescript
map((record: ApeRecord, index: number, data: ApeData) => ApeRecord) => ape
```

Takes a `map` function that is applied for each record in the array.

#### Example

```typescript
import { ape } from 'ape';

const data = [{ a: 'val 1' }, { a: 'val 2' }];
const newData = ape(data).map((record) => ({ a: record.a.toUpperCase() })).data;
// → [{ a: 'VAL 1' }, { a: 'VAL 2' }]
```

### Map value

```typescript
mapValue(key: ApeRecordKey, (value: Value, key: ApeRecordKey, index: number, data: ApeData) => Value) => ape
```

Takes a `mapValue` function that is applied to the value with the given key for each record in the array.

#### Example

```typescript
import { ape } from 'ape';

const data = [{ a: 'val 1' }, { a: 'val 2' }];
const newData = ape(data).mapValue('a', (a) => a.toUpperCase())).data;
// → [{ a: 'VAL 1' }, { a: 'VAL 2' }]
```

### Rename key

```typescript
renameKey(key: ApeRecordKey, newKey: ApeRecordKey) => ape
```

Renames the given key to `newKey` in each record in the array.

#### Example

```typescript
import { ape } from 'ape';

const data = [{ a: 'val 1' }, { a: 'val 2' }];
const newData = ape(data).renameKey('a', 'b').data;
// → [{ b: 'val 1' }, { b: 'val 2' }]
```

### Create index

```typescript
createIndex(keys: ApeRecordKey | ApeRecordKey[]) => ape
```

Creates an index for the given key or keys, by creating a hash-map of all possible values. This is a pre-requisite for using the `findByIndex()` function.

#### Example

See `findByIndex()`.

### Merge by index

```typescript
mergeByIndex(keys: ApeRecordKey | ApeRecordKey[], mergeData: ApeData) => ape
```

Merges the array with the given data by the given key or keys. For the given `mergeData` an index is created before the merge is performed.

#### Example

```typescript
import { ape } from 'ape';

const data = [
  { id: 1, a: 'val 1' },
  { id: 2, a: 'val 2' },
];
const otherData = [
  { id: 1, b: 'foo 1' },
  { id: 2, b: 'foo 2' },
];
const newData = ape(data).createIndex('id').mergeByIndex('id', otherData).data;
// → [{ id: 1, a: 'val 1', b: 'foo 1' }, { id: 2, a: 'val 2', b: 'foo 2' }]
```

### Find by index

```typescript
findByIndex(query: Partial<ApeRecord>) => ApeRecord | undefined
```

Returns the single record from the array of records that matches the given query or `undefined` if no record matches the query. Throws an error if no index exists for the keys present in the query.

#### Example

```typescript
import { ape } from 'ape';

const data = [
  { id: 1, a: 'val 1' },
  { id: 2, a: 'val 2' },
];
const result = ape(data).createIndex('id').findByIndex({ id: 1 });
// → { a: 'val 1' }
```

## Code of conduct

See [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)

## Contributing

To contribute to `@fec/ape`, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Install dependencies: `npm install`
4. Make your changes (please also update the tests and documentation)
5. Don't forgot to run the tests: `npm test`
6. Commit your changes: `git commit -m '<commit_message>'`
7. Push to the original branch: `git push origin <project_name>/<location>`
8. Create the pull request.

Alternatively see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## Change log

See [CHANGE_LOG](CHANGE_LOG.md)

## License

See [LICENSE](LICENSE.md)
