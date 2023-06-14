import * as React from 'react';
import { hydrate } from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';

import createEmotionCache from './style/createEmotionCache.ts';
import theme from './style/theme.ts';
import ClientStyleContext from './style/StylesContext.tsx';

interface ClientCacheProviderProps {
	children: React.ReactNode;
}
function ClientCacheProvider({ children }: ClientCacheProviderProps) {
	const [cache, setCache] = React.useState(createEmotionCache());

	const clientStyleContextValue = React.useMemo(
		() => ({
			reset() {
				setCache(createEmotionCache());
			},
		}),
		[]
	);

	return (
		<ClientStyleContext.Provider value={clientStyleContextValue}>
			<CacheProvider value={cache}>{children}</CacheProvider>
		</ClientStyleContext.Provider>
	);
}

const hydrateIt = async () => {
	React.startTransition(() => {
		hydrateRoot(
			document,
			<ClientCacheProvider>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<RemixBrowser />
				</ThemeProvider>
			</ClientCacheProvider>
		);
	});
};

if (window.requestIdleCallback) {
	window.requestIdleCallback(hydrateIt);
} else {
	// Safari doesn't support requestIdleCallback
	// https://caniuse.com/requestidlecallback
	window.setTimeout(hydrateIt, 1);
}
