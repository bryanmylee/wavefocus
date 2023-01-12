import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
		emptyOutDir: false,
		rollupOptions: {
			input: {
				index: 'index.html',
			},
		},
	},
});
