import svgr from '@svgr/rollup';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const generateScopedName = '[folder]__[local]--[hash:base64:5]';

export default defineConfig({
    plugins: [
        react(),
        svgr({
            exportType: 'default',
        }),
    ],
    css: {
        modules: {
            generateScopedName,
        },
        preprocessorOptions: {
            scss: {
                additionalData: '@import "./src/assets/styles/general/_mixins.scss";',
            },
        },
        devSourcemap: true,
    },
    resolve: {
        alias: [
            {
                find: '@/assets',
                replacement: path.resolve(__dirname, './src/assets'),
            },
            {
                find: '@/icons',
                replacement: path.resolve(__dirname, './src/assets/icons/index.ts'),
            },
            {
                find: '@/layouts',
                replacement: path.resolve(__dirname, './src/layouts/index.ts'),
            },
            {
                find: '@/ui',
                replacement: path.resolve(__dirname, './src/components/ui/index.ts'),
            },
            {
                find: '@/widgets',
                replacement: path.resolve(__dirname, './src/components/widgets/index.ts'),
            },
            {
                find: '@/components',
                replacement: path.resolve(__dirname, './src/components/common/index.ts'),
            },
            {
                find: '@/hooks',
                replacement: path.resolve(__dirname, './src/hooks/index.ts'),
            },
            {
                find: '@/services',
                replacement: path.resolve(__dirname, './src/services/index.ts'),
            },
            {
                find: '@/models',
                replacement: path.resolve(__dirname, './src/types/models/index.ts'),
            },
            {
                find: '@/type-guards',
                replacement: path.resolve(__dirname, './src/types/type-guards/index.ts'),
            },
            {
                find: '@/utility-types',
                replacement: path.resolve(__dirname, './src/types/utility-types/index.ts'),
            },
            {
                find: '@/contexts',
                replacement: path.resolve(__dirname, './src/contexts/index.ts'),
            },
            {
                find: '@/utils',
                replacement: path.resolve(__dirname, './src/utils/lib/index.ts'),
            },
            {
                find: '@/constants',
                replacement: path.resolve(__dirname, './src/utils/constants/index.ts'),
            },
            {
                find: '@/pages',
                replacement: path.resolve(__dirname, './src/pages/index.tsx'),
            },
        ],
    },
});
