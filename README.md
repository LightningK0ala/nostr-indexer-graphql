# nostr-indexer-graphql

Example of a graphql server using [nostr-indexer](https://github.com/LightningK0ala/nostr-indexer/blob/main/README.md)

## How to use

1. Install dependencies:

```
npm install
```

2. Setup database

```
DATABASE_URL=file:<FULL_PATH_TO_DB_FILE> npx prisma migrate reset --schema ./node_modules/nostr-indexer/dist/prisma/schema.prisma
```

Replace `FULL_PATH_TO_DB_FILE` with where you want the database file to live, eg. `/my-project/nostr.db`

3. Run

```
npm start
```
