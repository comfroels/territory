/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.server
 */

import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { EntryContext } from '@remix-run/deno';
import { RemixServer } from '@remix-run/react';
import createEmotionCache from './style/createEmotionCache';
import theme from './style/theme';
import { renderToString } from 'react-dom/server';

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	// const cache = createEmotionCache();
	// const { extractCriticalToChunks } = createEmotionServer(cache);

	function MuiRemixServer() {
		return (
			<CacheProvider value={createEmotionCache({ key: 'territory' })}>
				<ThemeProvider theme={theme}>
					{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
					<CssBaseline />
					<RemixServer context={remixContext} url={request.url} />
				</ThemeProvider>
			</CacheProvider>
		);
	}

	// Render the component to a string.
	const html = renderToString(<MuiRemixServer />);

	// Grab the CSS from emotion
	// const { styles } = extractCriticalToChunks(html);
	const styles = [];

	let stylesHTML = '';

	styles.forEach(({ key, ids, css }) => {
		const emotionKey = `${key} ${ids.join(' ')}`;
		const newStyleTag = `<style data-emotion="${emotionKey}">${css}</style>`;
		stylesHTML = `${stylesHTML}${newStyleTag}`;
	});

	// Add the Emotion style tags after the insertion point meta tag
	const markup = html.replace(
		/<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
		`<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`
	);

	responseHeaders.set('Content-Type', 'text/html');

	return new Response(`<!DOCTYPE html>${markup}`, {
		status: responseStatusCode,
		headers: responseHeaders,
	});
}
