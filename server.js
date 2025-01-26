import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { serveStatic } from '@hono/node-server/serve-static';
import * as ReactServerDom from 'react-server-dom-webpack/server.browser';

const app = new Hono();

/**
 * Endpoint to serve your index route.
 * Includes the loader `/build/_client.js` to request your server component
 * and stream results into `<div id="root">`
 */
app.get('/', async (c) => {
	return c.html(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>React Server Components from Scratch</title>
		</head>
		<body>
			<div id="root"></div>
			<script type="module" src="/build/_client.js"></script>
		</body>
		</html>
	`);
});

/**
 * Endpoint to render your server component to a stream.
 * This uses `react-server-dom-webpack` to parse React elements
 * into encoded virtual DOM elements for the client to read.
 */
app.get('/rsc', async (c) => {
	const Page = await import('./build/page.js');
	// React.createElement is a legacy API
	// Implement yourself: https://github.com/TejasQ/react-server-components-from-scratch/blob/spoild/server.tsx#L37
	const Comp = createElement(Page.default);

	// Streams are a browser standard, so you can retrun a web standard response object 
	// and your browser will know to keep fetching new stream results
	// Try: curl http://localhost:3000/rsc
	const stream = ReactServerDom.renderToReadableStream(Comp);
	return new Response(stream);
});

/**
 * Serve your `build/` folder as static assets.
 */
app.use('/build/*', serveStatic());

/**
 * Build both server and client components with esbuild
 */
async function build() {
	/** Build the server component tree */
	await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('page.jsx')],
		outdir: resolveBuild(),
		// avoid bundling npm packages for server-side components
		packages: 'external',
	});

	/** Build client components */
	await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('_client.jsx')],
		outdir: resolveBuild(),
		splitting: true,
	});
}

serve(app, async (info) => {
	await build();
	console.log(`Listening on http://localhost:${info.port}`);
});

/** UTILS */

const appDir = new URL('./app/', import.meta.url);
const buildDir = new URL('./build/', import.meta.url);

function resolveApp(path = '') {
	return fileURLToPath(new URL(path, appDir));
}

function resolveBuild(path = '') {
	return fileURLToPath(new URL(path, buildDir));
}
