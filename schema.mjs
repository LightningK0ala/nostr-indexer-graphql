import { createSchema } from 'graphql-yoga'

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Account {
      userId: String
      pubkey: String
    }

    type Relay {
      url: String
      connected: Boolean
    }

    type Query {
      started: Boolean
      dbFileSize: Int
      accounts: [Account]
      relays: [Relay]
    }
  `,
  resolvers: {
    Query: {
      started: (_, _args, ctx) => ctx.nostrIndexer.started,
      dbFileSize: async (_, _args, ctx) => ctx.nostrIndexer.dbFileSize(),
      relays: (_, _args, ctx) => {
        const relays = ctx.nostrIndexer.relayManager.relays.values()
        return Array.from(relays)
      },
      accounts: (_, _args, ctx) => {
        const accounts = ctx.nostrIndexer.accountManager.accounts.values()
        return Array.from(accounts)
      }
    }
  }
})