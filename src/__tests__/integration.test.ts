import { startServerAndCreateNextHandler } from '..';
import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import {
  CreateServerForIntegrationTestsOptions,
  defineIntegrationTestSuite,
} from '@apollo/server-integration-testsuite';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import { apiResolver } from 'next/dist/server/api-utils/node';

describe('nextHandler', () => {
  defineIntegrationTestSuite(
    async (
      serverOptions: ApolloServerOptions<BaseContext>,
      testOptions?: CreateServerForIntegrationTestsOptions,
    ) => {
      const server = new ApolloServer(serverOptions);
      const handler = startServerAndCreateNextHandler(server, testOptions);

      const httpServer = createServer((req, res) =>
        apiResolver(
          req,
          res,
          '',
          handler,
          {} as Parameters<typeof apiResolver>[4],
          false,
        ),
      );

      await new Promise<void>((resolve) => {
        httpServer.listen({ port: 0 }, resolve);
      });

      const { port } = httpServer.address() as AddressInfo;

      return {
        async extraCleanup() {
          await new Promise<void>((resolve) => {
            httpServer.close(() => resolve());
          });
        },
        server,
        url: `http://localhost:${port}`,
      };
    },
    {
      noIncrementalDelivery: true,
      serverIsStartedInBackground: true,
    },
  );
});
