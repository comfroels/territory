import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import type { V2_MetaFunction } from '@remix-run/deno';
import { useNavigate } from '@remix-run/react';
import * as React from 'react';
import { useUserContext } from '../contexts/user.tsx';
import { Game } from '../server/game.server.ts';
import { TileTypes } from '../utils.ts';
import BookIcon from '@mui/icons-material/Book';
import { RulesDialog } from '../components/RulesDialog.tsx';

export const meta: V2_MetaFunction = () => {
	return [
		{ title: 'Territory' },
		{ name: 'description', content: 'Welcome to Territory!' },
	];
};

const code = [
	'ArrowUp',
	'ArrowUp',
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'KeyB',
	'KeyA',
	'Enter',
];

let konamiIndex = 0;

function konamiCode(evt: KeyboardEvent) {
	if (evt.code === code[konamiIndex]) {
		konamiIndex++;
		if (konamiIndex === 11) {
			const borderElement = document.getElementById('crazy-border');
			if (borderElement) {
				borderElement.style.border = '10px solid black';
				borderElement.style.borderImage =
					"url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cstyle%3Epath%7Banimation:stroke 5s infinite linear%3B%7D%40keyframes stroke%7Bto%7Bstroke-dashoffset:776%3B%7D%7D%3C/style%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%232d3561' /%3E%3Cstop offset='25%25' stop-color='%23c05c7e' /%3E%3Cstop offset='50%25' stop-color='%23f3826f' /%3E%3Cstop offset='100%25' stop-color='%23ffb961' /%3E%3C/linearGradient%3E %3Cpath d='M1.5 1.5 l97 0l0 97l-97 0 l0 -97' stroke-linecap='square' stroke='url(%23g)' stroke-width='3' stroke-dasharray='388'/%3E %3C/svg%3E\") 1";
				borderElement.style.background = `-webkit-linear-gradient(45deg, #2d3561, #c05c7e, #f3826f, #ffb961)`;
			}
		}
	} else {
		konamiIndex = 0;
	}
}

export default function Index() {
	const [games, setGames] = React.useState([]);
	const [gameId, setGameId] = React.useState('');
	const { user, setUser } = useUserContext();
	const [isRulesOpen, setIsRulesOpen] = React.useState(false);
	const navigate = useNavigate();

	React.useEffect(() => {
		if (typeof window === 'undefined') return;
		window.document.addEventListener('keydown', konamiCode);
		return () => window.document.removeEventListener('keydown', konamiCode);
	}, []);

	async function newGame() {
		const game: Game = {
			id: Math.random().toString(36).slice(2),
			opponent: {
				id: '',
				currency: { wood: 0, stone: 0 },
			},
			initiator: {
				id: user,
				currency: { wood: 0, stone: 0 },
			},
			currentTurn: user,
			board: [
				[
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
				],
				[
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
				],
				[
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
				],
				[
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
				],
				[
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
					getRandomTile(),
				],
			],
		};
		const data = await fetch('/api/games', {
			method: 'POST',
			body: JSON.stringify(game),
		});
		const returnData = await data.json();
		navigate(`/game/${returnData.data.id}`);
	}

	async function joinGame(gameId) {
		const result = await fetch(`/api/game/${gameId}`);
		const game = await result.json();
		const addToGame = await fetch('/api/games', {
			method: 'POST',
			body: JSON.stringify({
				...game,
				opponent: {
					currency: { wood: 0, stone: 0 },
					id: user,
				},
			}),
		});
		const returnData = await addToGame.json();
		navigate(`/game/${returnData.data.id}`);
	}

	return (
		<Grid container spacing={2} p={3}>
			<Grid xs={12} my={2}>
				<Typography
					textAlign='center'
					variant='h1'
					fontFamily='VT323, monospace'
					id='crazy-border'>
					Territory
				</Typography>
			</Grid>

			<Grid xs={6} xsOffset={3}>
				<Button onClick={() => setIsRulesOpen(true)} startIcon={<BookIcon />}>
					Rules
				</Button>
				<RulesDialog
					open={isRulesOpen}
					handleClose={() => setIsRulesOpen(false)}
				/>
			</Grid>
			<Grid xs={5} xsOffset={1}>
				<Stack
					component={Paper}
					spacing={2}
					p={3}
					my={2}
					sx={{ borderRadius: 3 }}
					elevation={3}>
					<Typography variant='h4'>New Game</Typography>
					<TextField
						name='username'
						label='Username'
						value={user}
						onChange={(evt) => setUser(evt.target.value)}
					/>
					<Button onClick={() => newGame()}>Start New Game</Button>
				</Stack>
				<Stack
					component={Paper}
					spacing={2}
					p={3}
					my={2}
					sx={{ borderRadius: 3 }}
					elevation={3}>
					<Typography variant='h4'>Join Game</Typography>
					<TextField
						name='gameId'
						label='Game ID'
						value={gameId}
						onChange={(evt) => setGameId(evt.target.value)}
					/>
					<TextField
						name='username'
						label='Username'
						value={user}
						onChange={(evt) => setUser(evt.target.value)}
					/>
					<Button onClick={() => joinGame(gameId)}>Join Game</Button>
				</Stack>
			</Grid>
			<Grid xs={5}>
				<Box
					width='100%'
					component='img'
					src='/territory.png'
					alt='mountains and trees in pixel art'
				/>
			</Grid>
		</Grid>
	);
}

const getRandomTile = () => {
	const tiles = Object.values(TileTypes);
	return {
		tile: tiles[Math.floor(Math.random() * (tiles.length - 2))],
		owner: null,
	};
};
