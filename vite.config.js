import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
            fonts: [
                bunny('Figtree', {
                    alias: 'sans',
                    weights: [400, 500, 600, 700],
                }),
                bunny('IBM Plex Mono', {
                    alias: 'mono',
                    weights: [400, 500, 600],
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                        return 'vendor';
                    }
                    if (id.includes('node_modules/recharts')) {
                        return 'recharts';
                    }
                    if (id.includes('node_modules/@xyflow/react')) {
                        return 'flow';
                    }
                    if (id.includes('node_modules/@inertiajs/react')) {
                        return 'inertia';
                    }
                },
            },
        },
    },
});
