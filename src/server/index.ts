import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { apiRoutes } from './routes';
import { resolve } from 'path';

const clientDir = resolve(import.meta.dir, '../client');

const app = new Elysia()
  .use(cors())
  .use(apiRoutes)
  .get('/', () => Bun.file(`${clientDir}/index.html`))
  .get('/assets/:file', ({ params }) => {
    return Bun.file(`${clientDir}/dist/assets/${params.file}`);
  })
  .listen({ port: 3000, hostname: '0.0.0.0' });

console.log(
  `🚀 Servidor Kanban rodando em http://localhost:${app.server?.port}`,
);
console.log(`   Acesse no navegador: http://localhost:3000`);
