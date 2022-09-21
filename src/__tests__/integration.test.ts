import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import {
  CreateServerForIntegrationTestsOptions,
  defineIntegrationTestSuite,
} from '@apollo/server-integration-testsuite';
import { createServer } from 'http';
import type { NextApiHandler } from 'next';
import { urlForHttpServer } from '../utils';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { parse as parseUrl } from 'url';
import { startServerAndCreateNextHandler } from '..';

describe('nextjsHandler', () => {
  defineIntegrationTestSuite(
    async function (
      serverOptions: ApolloServerOptions<BaseContext>,
      testOptions?: CreateServerForIntegrationTestsOptions,
    ) {
      const httpServer = createServer();
      const server = new ApolloServer({
        ...serverOptions,
      });

      const handler: NextApiHandler = testOptions
        ? startServerAndCreateNextHandler(server, testOptions)
        : startServerAndCreateNextHandler(server);

      httpServer.addListener('request', (req, res) =>
        apiResolver(
          req,
          res,
          { ...parseUrl(req.url || '', true).query }, // query params to pass through
          handler,
          {
            previewModeId: '',
            previewModeEncryptionKey: '',
            previewModeSigningKey: '',
          },
          true,
        ),
      );

      await new Promise<void>((resolve) => {
        httpServer.listen({ port: 0 }, resolve);
      });

      return {
        server,
        url: urlForHttpServer(httpServer),
        async extraCleanup() {
          await new Promise<void>((resolve) => {
            httpServer.close(() => resolve());
          });
        },
      };
    },
    {
      serverIsStartedInBackground: true,
    },
  );
});
