# nostr-indexer-graphql

Example of a graphql server using [nostr-indexer](https://github.com/LightningK0ala/nostr-indexer/blob/main/README.md)

<img width="1762" alt="Xnapper-2023-01-30-03 00 14" src="https://user-images.githubusercontent.com/1495499/215378497-db623789-86cd-4e25-9b93-9f9b4be3718c.png">

## How to use

1. Install dependencies:

```console
npm install
```

2. Setup database

```console
DATABASE_URL=file:<FULL_PATH_TO_DB_FILE> npx prisma migrate reset --schema ./node_modules/nostr-indexer/dist/prisma/schema.prisma
```

Replace `FULL_PATH_TO_DB_FILE` with where you want the database file to live, eg. `/my-project/nostr.db`

3. Run

```console
npm start
```
