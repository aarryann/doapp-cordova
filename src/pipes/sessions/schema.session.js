// This example demonstrates a simple server with some
// relational data: Posts and Authors. You can get the
// posts for a particular author, and vice-versa

// Read the complete docs for graphql-tools here:
// http://dev.apollodata.com/tools/graphql-tools/generate-schema.html

import { find, filter } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import { compareHash, encrypt } from '../../services/utils';

const typeDefs = `
  type AppVersions {
    id: Int!
    appVersion: String
    dbVersion: String
    upgradeMode: String
    status: String
    updated: String
  }

  type User {
    id: Int!
    firstName: String
    lastName: String
    email: String
    password: String
    boards: [Board] # the list of Boards by this User
  }

  type UserAuth {
    jwt: String
    user: User!
  }

  type Board {
    id: Int!
    name: String
    slug: String
    user: User
  }

  # the schema allows the following query:
  type Query {
    boards: [Board]
    user(id: Int!): User
    localAuth(email: String!, password: String!): UserAuth
  }

  # this schema allows the following mutation:
  type Mutation {
    upvoteBoard (
      boardId: Int!
    ): Board
  }
`;

const resolvers = {
  Query: {
    boards: () => boards,
    user: (_, { id }, {db}) => {
      console.log(db);
      const d = find(users, { id: id });
      return d;
    },
    localAuth: async (_, { email, password }, { db }) => {
      const rs = await db.executeSql('SELECT * FROM users WHERE email = ?', [email]);
      if (rs.rows.length > 0 && compareHash(password, rs.rows.item(0).ENCRYPTED_PASSWORD)){
        return {
          user: {
            id: rs.rows.item(0).ID,
            firstName: rs.rows.item(0).FIRST_NAME,
            lastName: rs.rows.item(0).LAST_NAME,
            email: rs.rows.item(0).EMAIL,
            password : encrypt(password)
          }
        }
      } else {
        throw new Error("Invalid email or password");
      }
    },
  },
  Mutation: {
    upvoteBoard: (_, { boardId }) => {
      const board = find(boards, { id: boardId });
      if (!board) {
        throw new Error(`Couldn't find board with id ${boardId}`);
      }
      //post.votes += 1;
      return board;
    },
  },
  User: {
    boards: (user) => filter(boards, { userId: user.id }),
  },
  Board: {
    user: (board) => find(users, { id: board.userId }),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});

const AppVersions = [
  { id: 1, appVersion: '0.1', dbVersion: '0.1', upgradeMode: 'copy', status: 'current', lastChange: '' },
];

const users = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@be.com', password: '12345678', lastChange: '' },
  { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@be.com', password: '12345678', lastChange: '' },
];

const boards = [
  { id: 1, userId: 1, name: 'GraphQL', slug: 'graphql', lastChange: '' },
  { id: 2, userId: 1, name: 'Apollo', slug: 'apollo', lastChange: '' },
  { id: 3, userId: 2, name: 'Cordova', slug: 'cordova', lastChange: '' },
  { id: 4, userId: 2, name: 'React', slug: 'react', lastChange: '' },
];
