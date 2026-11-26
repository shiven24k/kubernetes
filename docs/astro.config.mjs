// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Learn Kubernetes',
			sidebar: [
				{ label: 'Start Here', items: [{ autogenerate: { directory: '00-start' } }] },
				{ label: '1. Prerequisites', items: [{ autogenerate: { directory: '01-prerequisites' } }] },
				{ label: '2. Kubernetes Core', items: [{ autogenerate: { directory: '02-kubernetes' } }] },
				{ label: '3. Scaling', items: [{ autogenerate: { directory: '03-scaling' } }] },
				{ label: '4. Hands-on Lab', items: [{ autogenerate: { directory: '04-lab' } }] },
				{ label: '5. Reference', items: [{ autogenerate: { directory: '05-reference' } }] },
			],
		}),
	],
});
