DATABASE_URL := "postgresql://postgres:indexer@localhost:5432/postgres"

.PHONY: start bootstrap reset-db

start:
	DATABASE_URL=${DATABASE_URL} yarn dev

bootstrap:
	-docker-compose up -d
	cd ../nostr-indexer && make bootstrap && make link
	yarn
	make reset-db

reset-db:
	DATABASE_URL=${DATABASE_URL} npx prisma migrate reset --force --schema ./node_modules/nostr-indexer/prisma/schema.prisma
