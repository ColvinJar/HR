import { buildServer } from './app.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

buildServer()
  .then((app) => app.listen({ port, host }))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
