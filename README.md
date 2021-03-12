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

`map((record, index, data) => mappedRecord)` works exactly the same as the native `Array.map()` function.

Example:

```javascript
const data = ape(myDataArr).map((record, index) => ({ ...record, index })).data;
```

### `mapValue`: Maps a single value

`mapValue(key, (value, key, index, data) => mappedValue)` takes a key and a function and calls this function with the value corresponding with the given key for each record.

### `rename`: Renames a key

`rename(key, newKey)` renames a key in each record.

### `createIndex`

### `findByIndex`

## Code of conduct

## Contributing

## Change log

## License
