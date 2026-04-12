import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vite';

// Force Vite restart to clear module timeout cache
export default defineConfig({ 
	plugins: [tailwindcss(), sveltekit(), imagetools()],
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:8787',
				changeOrigin: true,
				secure: false,
				cookieDomainRewrite: 'localhost',
			},
			'/images': {
				target: 'http://127.0.0.1:8787',
				changeOrigin: true,
				secure: false,
			}
		}
	},
	ssr: {
		noExternal: [
			'lucide-svelte',
			'layerchart',
			'd3-scale',
			'd3-shape',
			'd3-format',
			'd3-array',
			'd3-color',
			'd3-interpolate',
			'd3-path',
			'sveltekit-superforms',
			'svelte-sonner',
			'runed',
			'bits-ui',
		]
	},
	optimizeDeps: {
		include: ['layerchart', 'd3-scale', 'd3-shape', 'd3-format'],
		exclude: ['runed'],
	},
});
