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

export default function Index() {
	const [games, setGames] = React.useState([]);
	const [gameId, setGameId] = React.useState('');
	const { user, setUser } = useUserContext();
	const [isRulesOpen, setIsRulesOpen] = React.useState(false);
	const navigate = useNavigate();

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
				<Typography textAlign='center' variant='h1'>
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
