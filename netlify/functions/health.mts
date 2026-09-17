import type { Config } from '@netlify/functions';

export default async () =>
  Response.json({
    status: 'ok',
    name: 'World Pulse API',
    time: new Date().toISOString(),
  });

export const config: Config = {
  path: '/api/health',
};
