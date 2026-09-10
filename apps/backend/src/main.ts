import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { AppDataSource } from './core/database/data-source';
import { appValidationPipe } from './common/pipes/validation.pipe';
import { seedCommand } from './commands/seed.command';

/**
 * Where the static storefront lives.
 *
 * STATIC_ROOT wins when set (that is how the Docker image points at /app/public).
 * Otherwise walk up from the compiled output looking for index.html, which
 * covers running from source locally - the number of directories between
 * dist/ and the site root differs between the two layouts, and hardcoding it
 * silently resolved to "/" inside the container.
 */
function resolveStaticRoot(): string {
  if (process.env.STATIC_ROOT) return path.resolve(process.env.STATIC_ROOT);

  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(__dirname, '..', '..');
}

const ROOT = resolveStaticRoot();

async function bootstrap() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  console.log('DB connected', AppDataSource.options.type);
  await seedCommand().catch(e => console.warn('seed failed', e.message));

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', allowedHeaders: 'Content-Type,Authorization' });
  app.useGlobalPipes(appValidationPipe);
  app.use(express.json());
  app.use(express.static(ROOT, { extensions: ['html'] }));
  app.use('/admin', express.static(path.join(ROOT, 'admin')));
  app.use('/product/:slug', (req, res) => res.sendFile(path.join(ROOT, 'product.html')));
  // Spotlight frontend lives on 3002 — redirect legacy :3000/ar there so http://localhost:3000/ar really works
  app.use('/ar', (req, res) => res.redirect('http://localhost:3002/ar'));
  app.use('/visual-search', (req, res) => res.redirect('http://localhost:3002/visual-search'));
  app.use('/stylist', (req, res) => res.redirect('http://localhost:3002/stylist'));
  app.use('/voice', (req, res) => res.redirect('http://localhost:3002/voice'));
  /**
   * Static 404 for the storefront only.
   *
   * Middleware added with app.use() runs BEFORE Nest's router, so a blanket
   * catch-all here swallows every controller route. Anything Nest owns is
   * passed through with next(); unmatched API paths then get Nest's own JSON
   * 404 rather than a page of HTML.
   */
  const NEST_PREFIXES = ['/api', '/payment'];
  app.use((req, res, next) => {
    const p = (req as any).path || (req as any).url || req.originalUrl || '';
    if (NEST_PREFIXES.some(prefix => p.startsWith(prefix))) return next();
    const file = path.join(ROOT, '404.html');
    if (fs.existsSync(file)) return res.status(404).sendFile(file);
    return res.status(404).json({ statusCode: 404, message: 'Not Found: ' + p });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS ShopNepal -> http://localhost:${port}`);
  console.log(`static root: ${ROOT}`);
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
    console.warn(`WARNING: no index.html under ${ROOT} - the storefront will 404.`);
  }
}
bootstrap();
