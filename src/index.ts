import type {
  ApolloServer,
  BaseContext,
  ContextFunction,
  HTTPGraphQLRequest,
} from '@apollo/server';
import type { WithRequired } from '@apollo/utils.withrequired';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'url';

export interface NextContextFunctionArgument {
  req: NextApiRequest;
  res: NextApiResponse;
}

export interface NextMiddlewareOptions<TContext extends BaseContext> {
  context?: ContextFunction<[NextContextFunctionArgument], TContext>;
}

export function startServerAndCreateNextHandler(
  server: ApolloServer<BaseContext>,
  options?: NextMiddlewareOptions<BaseContext>,
): NextApiHandler;
export function startServerAndCreateNextHandler<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<NextMiddlewareOptions<TContext>, 'context'>,
): NextApiHandler;
export function startServerAndCreateNextHandler<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: NextMiddlewareOptions<TContext>,
): NextApiHandler {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();
  // This `any` is safe because the overload above shows that context can
  // only be left out if you're using BaseContext as your context, and {} is a
  // valid BaseContext.
  const defaultContext: ContextFunction<
    [NextContextFunctionArgument],
    any
  > = async () => ({});

  const context: ContextFunction<[NextContextFunctionArgument], TContext> =
    options?.context ?? defaultContext;

  return async (req, res) => {
    const headers = new Map<string, string>();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const httpGraphQLRequest: HTTPGraphQLRequest = {
      method: req.method?.toUpperCase()!,
      headers,
      search: parse(req?.url!).search ?? '',
      body: req.body,
    };

    try {
      const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest,
        context: () => context({ req, res }),
      });

      if (httpGraphQLResponse.completeBody === null) {
        throw Error('Incremental delivery not implemented');
      }

      res
        .status(httpGraphQLResponse.status || 200)
        .send(httpGraphQLResponse.completeBody);
    } catch (error) {
      throw error;
    }
  };
}
