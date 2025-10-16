import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

const shouldAnalyze = process.env.ANALYZE === 'true';

const plugins: PluginOption[] = [react()];

if (shouldAnalyze) {
  plugins.push(
    visualizer({
      filename: 'bundle-report.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    }),
  );
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
