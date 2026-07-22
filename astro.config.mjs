// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import keystatic from '@keystatic/astro';

import cloudflare from '@astrojs/cloudflare';
import seoStarterPack from 'seo-starter-pack';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react(), keystatic(), seoStarterPack()],
  adapter: cloudflare({
    imageService: 'cloudflare',
  })
});