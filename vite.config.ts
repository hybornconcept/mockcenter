import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ 
	plugins: [tailwindcss(), sveltekit()],
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
		]
	},
	optimizeDeps: {
		include: ['layerchart', 'd3-scale', 'd3-shape', 'd3-format'],
	},
});
