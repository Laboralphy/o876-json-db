# JSON Database Library

*A lightweight, 100% TypeScript JSON document database with indexing support*

A minimalist, in-memory and file JSON database for Node.js/TypeScript applications. It stores documents in collections, 
supports top-level property indexing, and requires minimal external dependencies.



This library provides a lightweight, in-memory or file-system-based JSON document database with indexing and querying capabilities. It is designed for Node.js/TypeScript environments and supports basic CRUD operations, indexing, and a MongoDB-like query syntax.

---

## Table of Contents
- [Installation](#installation)
- [NPM scripts](#npm-scripts)
- [Core Classes](#core-classes)
    - [`Cursor<T>`](#cursor)
    - [`Collection<T>`](#collection)
- [Index Types](#index-types)
- [Usage](#usage)
    - [Initialization](#initialization)
    - [CRUD Operations](#crud-operations)
    - [Querying](#querying)
    - [Indexing](#indexing)
- [API Reference](#api-reference)
    - [`Cursor<T>` Methods](#cursor-methods)
    - [`Collection<T>` Methods](#collection-methods)
- [Examples](#examples)
- [Contributing](#contributing)


## Installation

```bash
npm install -S o876-json-db
```

## NPM scripts


| Script         | Description                                                                                                                                                 |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `npm test`     | Runs the test suite once using [Jest](https://jestjs.io/).                                                                                                  |
| `npm run test:watch` | Runs the test suite in watch mode: Jest will re-run tests on file changes.                                                                                  |
| `npm run build`| Compiles TypeScript source files into JavaScript using `tsc` (TypeScript Compiler). Only usefull if you need to use this library with a javascript program. |


---

## Core Classes

### `Cursor<T>`

The `Cursor` class enables lazy loading and iteration over a set of documents identified by their keys. It is typically returned by query operations and provides methods to navigate and fetch documents.

#### Features
- Lazy loading of documents
- Navigation methods: `first()`, `last()`, `next()`, `previous()`
- Iteration with `forEach()`
- Batch fetching with `fetchAll()`
- Merging cursors with `merge()`

---

### `Collection<T>`

The `Collection` class represents a collection of JSON documents. It supports:
- Document storage (in-memory or file system)
- Indexing for fast querying
- MongoDB-like query syntax
- Statistics and performance logging

---

## Index Types

The library supports several types of indexes, each optimized for different data types and use cases:

| Type      | Description                                                                                     | Options                                                                |
|-----------|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| `PARTIAL` | Indexes a substring of a string property. Useful for prefix-based searches.                      | `size`: Length of the substring to index (0 = full string). `nullable` |
| `NUMERIC` | Optimized for numeric properties. Supports range queries.                                      | `precision`: Number of decimal places to index. `nullable`, default 1  |
| `BOOLEAN` | Indexes boolean properties. Only two possible values: `true` and `false`.                       | `nullable`                                                             |
| `HASH`    | Standard hash-based index. Suitable for exact match queries on any data type.                   | `nullable`                                                             |
| `TRUTHY`  | Indexes based on "truthiness": `null`/`undefined` vs. any other value.                          | None                                                                   |

- `nullable`: If `true`, the index will include documents where the property is `null` or `undefined`.

---

## Usage

### Initialization

```typescript
import { Collection, INDEX_TYPES } from 'o876-json-db';
import { MemoryStorage, DiskStorage } from 'o876-json-db';

// Create a collection with indexes
const users = new Collection<User>('./data/users', {
  name: { type: INDEX_TYPES.PARTIAL, size: 3, nullable: true },
  age: { type: INDEX_TYPES.NUMERIC, precision: 1, nullable: false },
  isActive: { type: INDEX_TYPES.BOOLEAN },
  email: { type: INDEX_TYPES.HASH, nullable: true },
  hasProfile: { type: INDEX_TYPES.TRUTHY },
});

// Set storage adapter
users.storage = new MemoryStorage();
// or...
users.storage = new DiskStorage();

// Initialize the collection
await users.init();
```

### CRUD Operations

```typescript
// Save a document
await users.save('user1', { name: 'Alice', age: 30, isActive: true });

// Load a document
const user = await users.load('user1');

// Delete a document
await users.delete('user1');
```

### Querying

```typescript
// Find documents
const cursor = await users.find({ age: { $gte: 25 } });

// Iterate over results
// this is an async operation because document are being loaded for each iteration
await cursor.forEach((doc, key) => {
  console.log(key, doc);
});

// Fetch all results
// refrain from doing this when cursor covers a lot of documents
// All documents are loaded in memory
const results = await cursor.fetchAll();
```

### Indexing

```typescript
// Create an index after initialization
users.createIndex('email', INDEX_TYPES.HASH, { nullable: true });
```

---

## API Reference

### Cursor Methods

| Method          | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `current()`     | Returns the current document.                                               |
| `first()`       | Moves to the first document and returns it.                                 |
| `last()`        | Moves to the last document and returns it.                                  |
| `next()`        | Moves to the next document and returns it.                                  |
| `previous()`    | Moves to the previous document and returns it.                              |
| `forEach()`     | Iterates over all documents in the cursor.                                  |
| `fetchAll()`    | Returns an array of all documents in the cursor.                            |
| `merge(cursor)` | Merges another cursor into this one.                                        |

### Collection Methods

| Method               | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `init()`             | Initializes the collection and builds indexes.                             |
| `save(key, doc)`     | Saves a document to the collection.                                         |
| `load(key)`          | Loads a document by its key.                                                |
| `delete(key)`        | Deletes a document by its key.                                              |
| `find(query)`        | Finds documents matching the query and returns a cursor.                    |
| `createIndex(name, type, options)` | Creates an index on a property.                     |

---

## Query Operators

| Operator | Description                     |
|----------|---------------------------------|
| `$gte`   | Greater than or equal to.       |
| `$gt`    | Greater than.                   |
| `$lte`   | Less than or equal to.          |
| `$lt`    | Less than.                      |
| `$eq`    | Equal to.                       |
| `$neq`   | Not equal to.                   |

Example query:
```typescript
const cursor = await users.find({
  age: { $gte: 25 },
  name: { $eq: 'Alice' },
});
```

---

## Examples

### Using Partial Index

```typescript
// Index the first 3 characters of the 'name' property
users.createIndex('name', INDEX_TYPES.PARTIAL, { size: 3, nullable: true });

// Query for names starting with 'Ali'
const cursor = await users.find({ name: { $eq: 'Ali' } });
```

### Using Numeric Index

```typescript
// Index the 'age' property as a numeric value
users.createIndex('age', INDEX_TYPES.NUMERIC, { precision: 0, nullable: false });

// Query for ages greater than 25
const cursor = await users.find({ age: { $gt: 25 } });
```

### Using Truthy Index

```typescript
// Index the 'hasProfile' property as truthy
users.createIndex('hasProfile', INDEX_TYPES.TRUTHY);

// Query for documents where 'hasProfile' is not null/undefined
const cursor = await users.find({ hasProfile: { $neq: null } });
```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

```markdown
---
```

### Notes for self
- Add more examples, error handling, and advanced usage as needed.
- Include a section on custom storage adapters if applicable.

