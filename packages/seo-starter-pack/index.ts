import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'url';
import path from 'path';

export default function seoStarterPack(): AstroIntegration {
  return {
    name: 'seo-starter-pack',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        // We use absolute paths to ensure it resolves from the package correctly
        const currentDir = path.dirname(fileURLToPath(import.meta.url));

        injectRoute({
          pattern: '/robots.txt',
          entrypoint: path.join(currentDir, 'routes/robots.txt.ts')
        });
        injectRoute({
          pattern: '/llms.txt',
          entrypoint: path.join(currentDir, 'routes/llms.txt.ts')
        });
        injectRoute({
          pattern: '/sitemap.xml',
          entrypoint: path.join(currentDir, 'routes/sitemap.xml.ts')
        });
        injectRoute({
          pattern: '/sitemap-main.xml',
          entrypoint: path.join(currentDir, 'routes/sitemap-main.xml.ts')
        });
        injectRoute({
          pattern: '/sitemap-[collection].xml',
          entrypoint: path.join(currentDir, 'routes/sitemap-collection.xml.ts')
        });
        
        // Dashboard routes
        injectRoute({
          pattern: '/dashboard',
          entrypoint: path.join(currentDir, 'routes/dashboard/index.astro')
        });
        injectRoute({
          pattern: '/dashboard/crawl-stats',
          entrypoint: path.join(currentDir, 'routes/dashboard/crawl-stats.astro')
        });
        injectRoute({
          pattern: '/dashboard/crawl-surface',
          entrypoint: path.join(currentDir, 'routes/dashboard/crawl-surface.astro')
        });
        injectRoute({
          pattern: '/dashboard/page-speed',
          entrypoint: path.join(currentDir, 'routes/dashboard/page-speed.astro')
        });
        injectRoute({
          pattern: '/dashboard/entitymap',
          entrypoint: path.join(currentDir, 'routes/dashboard/entitymap.astro')
        });
        injectRoute({
          pattern: '/dashboard/entitymap.json',
          entrypoint: path.join(currentDir, 'routes/dashboard/entitymap.json.ts')
        });
        // API routes for telemetry
        injectRoute({
          pattern: '/api/snapshot',
          entrypoint: path.join(currentDir, 'routes/api/snapshot.js')
        });
        injectRoute({
          pattern: '/api/cwv',
          entrypoint: path.join(currentDir, 'routes/api/cwv.js')
        });
        injectRoute({
          pattern: '/api/cwv-snapshot',
          entrypoint: path.join(currentDir, 'routes/api/cwv-snapshot.js')
        });
        injectRoute({
          pattern: '/api/set-owner',
          entrypoint: path.join(currentDir, 'routes/api/set-owner.js')
        });
      }
    }
  };
}
