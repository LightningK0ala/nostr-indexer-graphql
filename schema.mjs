import { createSchema } from 'graphql-yoga'

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Filter {
      ids: [String]
      kinds: [Int]
      authors: [String]
      since: Int
      until: Int
      limit: Int
    }

    type Subscription {
      filters: [Filter]
    }

    type Account {
      user: User
      pubkey: String
    }

    type Relay {
      url: String
      connected: Boolean
      subscriptions: [Subscription]
    }

    type Metadata {
      user: User
      lud06:  String
      website: String
      nip05: String
      picture: String
      display_name: String
      banner: String
      about: String
      name: String
    }

    type User {
      id: String
      pubkey: String
      metadata: Metadata
    }

    type Query {
      started: Boolean
      dbFileSize: Int
      accounts: [Account]
      relays: [Relay]
      subscriptions: [Subscription]
      users: [User]
    }

    type Mutation {
      addRelay(url: String!): Relay
      addAccount(pubkey: String!): Account
    }
  `,
  resolvers: {
    Mutation: {
      addRelay: (_parent, { url }, ctx) => ctx.nostrIndexer.addRelay(url),
      addAccount: (_parent, { pubkey }, ctx) => ctx.nostrIndexer.addAccount(pubkey)
    },
    Query: {
      subscriptions: (_, _args, ctx) => Array.from(ctx.nostrIndexer.subscriptions.values()),
      started: (_, _args, ctx) => ctx.nostrIndexer.started,
      dbFileSize: async (_, _args, ctx) => ctx.nostrIndexer.dbFileSize(),
      relays: (_, _args, ctx) => ctx.nostrIndexer.db.client.relay.findMany(),
      accounts: (_, _args, ctx) => ctx.nostrIndexer.db.client.account.findMany(),
      users: async (_, args, ctx) => ctx.nostrIndexer.db.client.user.findMany()
    },
    Account: {
      user: async (parent, _args, ctx) => {
        return ctx.nostrIndexer.db.client.user.findUnique({ where: { id: parent.user_id } })
      }
    },
    User: {
      metadata: async (parent, _args, ctx) => ctx.nostrIndexer.db.client.metadata.findUnique({ where: { user_id: parent.id } }),
    },
    Metadata: {
      user: async (parent, _args, ctx) => ctx.nostrIndexer.db.client.user.findUnique({ where: { id: parent.user_id } }),
    },
  }
})