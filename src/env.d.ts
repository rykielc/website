/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/cloudflare" />
/// <reference path="../worker-configuration.d.ts" />

/**
 * Astro App Context Augmentation
 * Astro.locals.runtime inherits Env directly from worker-configuration.d.ts
 * (which contains DB, MEDIA, LOADER, and EMDASH_ENCRYPTION_KEY).
 */
declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
      cf: CfProperties;
      caches: CacheStorage;
    };
  }
}
declare module "cloudflare:workers" {
  export const env: Env;
}