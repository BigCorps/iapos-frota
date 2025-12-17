import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { appRouter } from '../../server/routers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Criar contexto simplificado para Vercel
  const createContext = async () => {
    return {
      req: req as any,
      res: res as any,
      user: null, // Por enquanto sem autenticação
    };
  };

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: new Request(`https://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers as any,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    }),
    router: appRouter,
    createContext,
  });
}