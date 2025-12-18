// api/trpc.ts - Vercel Serverless Function for tRPC
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../server/routers';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Build full URL for fetch handler
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const url = `${protocol}://${host}${req.url}`;
    
    // Convert Vercel request to Fetch API Request
    const fetchReq = new Request(url, {
      method: req.method || 'GET',
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body
        ? JSON.stringify(req.body)
        : undefined,
    });

    // Handle with tRPC fetch adapter
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: fetchReq,
      router: appRouter,
      createContext: async () => {
        // Context com user null (adicione lógica de auth aqui se necessário)
        return {
          req: req as any,
          res: res as any,
          user: null, // TODO: Implementar autenticação via cookie/header
        };
      },
    });

    // Set response status
    res.status(response.status);

    // Copy headers from fetch response to Vercel response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response body
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('tRPC handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}