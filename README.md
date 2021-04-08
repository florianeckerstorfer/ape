# Ape

Ape is an _array processing engine_. It takes an array of records and gives you a convenient interface to operate on it. Operations are processed in batch.

Made by 👨‍💻 [Florian Eckerstorfer](https://florian.ec) in 🎡 Vienna, Europe.

![](assets/readme-monkeys.svg)

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

`ape` does only have a single export, the titular `Ape` class. You add operations, such as `map()` or `renameKey()` and then process the given array.

```javascript
import Ape from 'ape';

const ape = new Ape([{ a: 'val 1' }, { a: 'val 2' }]);
const data = ape
  .map((record) => ({ a: record.a.toUpperCase() }))
  .renameKey('a', 'b')
  .process();
// → [{ b: 'VAL 1' }, { b: 'VAL 2' }]
```

You can find a list of all operations and methods `Ape` provides in the [Ape API docs](https://ape.const.sh/main/index.html).

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

Soon™️

## License

See [LICENSE](LICENSE.md)
