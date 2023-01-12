import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
		emptyOutDir: false,
		lib: {
			formats: ['iife'],
			entry: 'src/background/main.ts',
			name: 'Wave Focus',
		},
		rollupOptions: {
			output: {
				entryFileNames: 'background.js',
				extend: true,
			},
		},
	},
});
