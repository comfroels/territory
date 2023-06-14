import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import type { LinksFunction } from '@remix-run/deno';
import { cssBundleHref } from '@remix-run/css-bundle';
import { withEmotionCache } from '@emotion/react';
import * as React from 'react';
import HeartIcon from '@mui/icons-material/Favorite';
import CodeIcon from '@mui/icons-material/Code';
import {
	unstable_useEnhancedEffect as useEnhancedEffect,
	Stack,
	Link,
	Typography,
} from '@mui/material';
import ClientStyleContext from './style/StylesContext.tsx';
import { UserContextProvider } from './contexts/user.tsx';

export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

const Document = withEmotionCache((props, emotionCache) => {
	const clientStyleData = React.useContext(ClientStyleContext);

	// Only executed on client
	useEnhancedEffect(() => {
		// re-link sheet container
		emotionCache.sheet.container = document.head;
		// re-inject tags
		const tags = emotionCache.sheet.tags;
		emotionCache.sheet.flush();
		tags.forEach((tag) => {
			// eslint-disable-next-line no-underscore-dangle
			(emotionCache.sheet as any)._insertTag(tag);
		});
		// reset cache to reapply global styles
		clientStyleData.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width,initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body>
				<UserContextProvider initialUser=''>
					<Outlet />
				</UserContextProvider>
				<Stack>
					<Stack
						width='100%'
						direction='row'
						justifyContent='center'
						alignItems='center'>
						<CodeIcon sx={{ mr: 2 }} />
						<Typography>with</Typography>
						<HeartIcon sx={{ mx: 2 }} />
						<Typography>by</Typography>
						<Link
							sx={{ ml: 2 }}
							href='https://github.com/comfroels'
							target='_blank'
							rel='noreferrer'>
							comfroels
						</Link>
					</Stack>
					<Typography variant='subtitle1' textAlign='center' my={2}>
						All images are generated using Midjourney AI
					</Typography>
					<Typography variant='subtitle1' textAlign='center' my={2}>
						Highly based off of{' '}
						<Link
							target='_blank'
							rel='noreferrer'
							href='https://github.com/denoland/tic-tac-toe'>
							Tic-Tac-Toe multiplayer example
						</Link>
					</Typography>
				</Stack>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
});

export default function App() {
	return <Document />;
}
