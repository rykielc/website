import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import icon from "astro-iconset";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
    // 1. Target Domain Configuration for Canonical URLs & SEO/GEO Mapping
    site: "https://aiya.community",

    // 2. Rendering Mode & Cloudflare Pages Edge Adapter
    output: "server",
    adapter: cloudflare(),

    image: {
        layout: "constrained",
        responsiveStyles: true,
    },

    vite: {
        ssr: {
            optimizeDeps: {
                // Pre-bundle so it isn't discovered mid-render under workerd
                include: ["astro-iconset/components"],
            },
        },
    },

    integrations: [
        react(),
        icon({
            include: {
                ph: [
                    "chart-bar",
                    "check-circle",
                    "clock",
                    "cloud",
                    "code",
                    "currency-dollar",
                    "envelope",
                    "globe",
                    "heart",
                    "lifebuoy",
                    "lightning",
                    "lock",
                    "shield-check",
                    "sparkle",
                    "star",
                    "users-three",
                ],
            },
        }),
        emdash({
            database: d1({ binding: "DB", session: "auto" }),
            storage: r2({ binding: "MEDIA" }),
            plugins: [
                {
                    id: "marketing-blocks",
                    version: "0.1.0",
                    entrypoint: new URL("./src/plugins/marketing-blocks/index.ts", import.meta.url).href,
                },
            ],
        }),
    ],

    fonts: [
        {
            provider: fontProviders.google(),
            name: "Inter",
            cssVariable: "--font-body",
            weights: [400, 500, 600, 700, 800],
            fallbacks: ["sans-serif"],
        },
    ],

    devToolbar: { enabled: false },
});