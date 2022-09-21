# `@as-integrations/nextjs`

## A TypeScript/JavaScript GraphQL middleware for `@apollo/server`

## Getting started: Nextjs integration

Apollo Server enables the ability to add middleware that lets you run your GraphQL server as part of an app built with Nextjs, one of the most popular web frameworks for Node.

First, create a new nextjs app (visit nextjs [docs](https://nextjs.org/docs/api-reference/create-next-app) for more options/templates):

```
npx create-next-app@latest
```

Then, install Apollo Server, and the JavaScript implementation of the core GraphQL algorithms packages:

```
npm install @apollo/server graphql
```

Finally, write the following to `./pages/api/graphql.js` to utilize [API Routes](https://nextjs.org/docs/api-routes/introduction) built into the nextjs framework:

```js
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/nextjs";

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default startServerAndCreateNextHandler(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
});
```

Now run your nextjs app with:

```
npm run dev
```

Open the URL it prints in a web browser and visit the `/api/graphql` route. It will show Apollo Sandbox, a web-based tool for running GraphQL operations. Try running the operation `query { hello }`!