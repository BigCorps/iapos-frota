import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { appRouter } from '../../server/routers';
import { createContext } from '../../server/_core/context';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: req as any,
    router: appRouter,
    createContext: () => createContext({ req, res }),
  });
}