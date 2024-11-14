import { resolve }                             from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react                                   from '@vitejs/plugin-react'

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
            build: { rollupOptions: { external: [ resolve('src/core/common/events.json') ] } }
        },
        renderer: {
            resolve: { alias: { '@renderer': resolve('src/renderer/src'), '@': resolve('src/core') }, },
            plugins: [ react() ],
            build: { rollupOptions: { external: [ resolve('src/core/common/events.json') ] } }
        },
    }
);
