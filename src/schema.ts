import { createSchema } from "graphql-yoga";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { Indexer } from "nostr-indexer";

export const schema = createSchema<{ nostrIndexer: Indexer }>({
  typeDefs: /* GraphQL */ `
    scalar Date

    # enum EventKind {
    #   Metadata = 0,
    #   Text = 1,
    #   RecommendRelay = 2,
    #   Contacts = 3,
    #   EncryptedDirectMessage = 4,
    #   EventDeletion = 5,
    #   Reaction = 7,
    #   ChannelCreation = 40,
    #   ChannelMetadata = 41,
    #   ChannelMessage = 42,
    #   ChannelHideMessage = 43,
    #   ChannelMuteUser = 44,
    # }

    type Event {
      event_id: String
      event_created_at: Date
    }

    type Relay {
      #   id: Int
      url: String
      connected: Boolean
      connectedAt: Date
      #   added_at: Date
    }

    type Metadata {
      user: User
      lud06: String
      lud16: String
      website: String
      nip05: String
      picture: String
      display_name: String
      banner: String
      about: String
      name: String
      event: Event
    }

    type User {
      id: String
      pubkey: String
      metadata: Metadata
      follows: [User]
      followers: [User]
      followsCount: Int
      followersCount: Int
    }

    type Filter {
      ids: [String]
      kinds: [Int]
      authors: [String]
      since: Date
      until: Date
      limit: Int
    }

    type FilterWrapper {
      hash: String
      filter: Filter
      user: User
    }

    type RelaySubscription {
      subscribedRelays: [String]
      filters: [FilterWrapper]
    }

    type RelaySubscriptionWrapper {
      kind: Int
      subscription: RelaySubscription
    }

    type Query {
      started: Boolean
      dbFileSize: Int
      relays: [Relay]
      accounts: [User]
      users: [User]
      user(pubkey: String): User
      # relaySubscriptions: [RelaySubscriptionWrapper]
    }

    type Mutation {
      addAccount(pubkey: String!, relays: [String]): Boolean
      addRelays(urls: [String]): Boolean
      removeRelay(url: String): Boolean
      start: Boolean
      stop: Boolean
    }
  `,
  resolvers: {
    Date: new GraphQLScalarType({
      name: "Date",
      description: "Date",
      parseValue: (value: any) => new Date(value),
      serialize: (value: any) => new Date(value).toISOString(),
      parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
          return new Date(ast.value);
        }
        throw new GraphQLError("Provided value is not an odd integer", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      },
    }),
    Mutation: {
      addAccount: async (_parent, { pubkey, relays }, ctx) =>
        ctx.nostrIndexer.addAccount({ pubkey, relays }),
      addRelays: (_parent, { urls }, ctx) =>
        urls.forEach((url: string) => ctx.nostrIndexer.addRelay({ url })),
      removeRelay: (_parent, { url }, ctx) =>
        ctx.nostrIndexer.removeRelay({ url }),
      start: async (_parent, _, ctx) => ctx.nostrIndexer.start(),
      stop: async (_parent, _, ctx) => ctx.nostrIndexer.stop(),
    },
    Query: {
      // dbFileSize: async (_, _args, ctx) => ctx.nostrIndexer.dbFileSize(),
      accounts: async (_, { pubkey }, ctx) =>
        ctx.nostrIndexer.db.client.user.findMany({
          where: { is_account: true },
        }),
      users: async (_, args, ctx) => ctx.nostrIndexer.db.client.user.findMany(),
      user: async (_, { pubkey }, ctx) => ctx.nostrIndexer.findUser({ pubkey }),
      relays: (_, args, ctx) => [
        ...ctx.nostrIndexer.relayManager.relays.values(),
      ],
      started: (_, args, ctx) => ctx.nostrIndexer.started,
      // relaySubscriptions: (_, args, ctx) => {
      //   return [...ctx.nostrIndexer.subscriptions.entries()].map(([kind, subscription]) => {
      //     return {
      //       kind,
      //       subscription: {
      //         subscribedRelays: subscription.subscribedRelays.entries(),
      //         filters: [...subscription.filters.entries()].map(([hash, { filter, user }]) => ({ hash, filter, user }))
      //       }
      //     }
      //   })
      // },
    },
    User: {
      metadata: async (parent, _args, ctx) =>
        ctx.nostrIndexer.db.client.metadata.findUnique({
          where: { user_pubkey: parent.pubkey },
        }),
    },
    Metadata: {
      user: async (parent, _args, ctx) =>
        ctx.nostrIndexer.db.client.user.findUnique({
          where: { id: parent.user_id },
        }),
      event: async (parent, _args, ctx) =>
        ctx.nostrIndexer.db.client.event.findUnique({
          where: { id: parent.event_id },
        }),
    },
  },
});
