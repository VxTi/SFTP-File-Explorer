import react                                   from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve }                             from 'path';

export default defineConfig(
    {
        main: {
            plugins: [ externalizeDepsPlugin() ],
            resolve: { alias: { '@': resolve('src/core') } },
            build: { rollupOptions: { external: [ resolve('src/core/common/events.json') ] } }
        },
        preload: {
            plugins: [ externalizeDepsPlugin() ],
            resolve: { alias: { '@': resolve('src/core') } },
        },
        renderer: {
            resolve: { alias: { '@renderer': resolve('src/renderer/src'), '@': resolve('src/core') }, },
            plugins: [ react() ],
        },
    }
);
