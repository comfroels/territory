import BookIcon from '@mui/icons-material/Book';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ForestIcon from '@mui/icons-material/Forest';
import LandscapeIcon from '@mui/icons-material/Landscape';
import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardActions,
	CardContent,
	CardMedia,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { blue, blueGrey, green, grey, red } from '@mui/material/colors';
import { useNavigate, useParams } from '@remix-run/react';
import React, { useState } from 'react';
import { RulesDialog } from '../components/RulesDialog.tsx';
import { useUserContext } from '../contexts/user.tsx';
import { useDataSubscription } from '../hooks.ts';
import { Game as GameType, Tile } from '../server/game.server.ts';
import { EXPENSE, TileAmounts, TileImages, TileTypes } from '../utils.ts';

const yourColor = blue[400];
const theirColor = red[400];

export default function Game() {
	const { id } = useParams();
	const [game, setGame] = useState<GameType>({});
	const { user, setUser } = useUserContext();
	const [isRulesOpen, setIsRulesOpen] = useState(false);
	const [over, setOver] = useState<{ isOver: boolean; winner: string | false }>(
		{ isOver: false, winner: false }
	);
	const navigate = useNavigate();

	useDataSubscription(() => {
		const eventSource = new EventSource(
			`/api/game?id=${encodeURIComponent(id)}`
		);
		eventSource.onmessage = (e) => {
			const newGame = JSON.parse(e.data);
			setGame(newGame.game);
			setOver({ isOver: newGame.isOver, winner: newGame.winner });
		};
		return () => eventSource.close();
	}, [id]);

	const isTurn = game.currentTurn === user;

	async function updateGame({ rowIndex, columnIndex, tile }) {
		game.board[rowIndex][columnIndex] = tile;
		const isOpponent = game.opponent.id === user;

		if (isTurn) {
			switch (tile.tile) {
				case TileTypes.CASTLE:
					{
						if (isOpponent) {
							game.opponent.currency.wood -= EXPENSE.castle.wood;
							game.opponent.currency.stone -= EXPENSE.castle.stone;
						} else {
							game.initiator.currency.wood -= EXPENSE.castle.wood;
							game.initiator.currency.stone -= EXPENSE.castle.stone;
						}
					}
					break;
				case TileTypes.FORTRESS:
					{
						if (isOpponent) {
							game.opponent.currency.wood -= EXPENSE.fortress.wood;
							game.opponent.currency.stone -= EXPENSE.fortress.stone;
						} else {
							game.initiator.currency.wood -= EXPENSE.fortress.wood;
							game.initiator.currency.stone -= EXPENSE.fortress.stone;
						}
					}
					break;
				default: {
					if (isOpponent) {
						game.opponent.currency.wood += TileAmounts[tile.tile].wood;
						game.opponent.currency.stone += TileAmounts[tile.tile].stone;
					} else {
						game.initiator.currency.wood += TileAmounts[tile.tile].wood;
						game.initiator.currency.stone += TileAmounts[tile.tile].stone;
					}
				}
			}
		}
		const response = await fetch(`/api/game?id=${encodeURIComponent(id)}`, {
			method: 'POST',
			body: JSON.stringify(game),
		});
	}

	return (
		<Grid container spacing={2}>
			<Grid xs={12}>
				<Stack>
					<Grid xs={10} xsOffset={1}>
						<Stack p={2} component={Paper} borderRadius={3} elevation={3} m={2}>
							<Typography
								variant='h1'
								textAlign='center'
								fontFamily='VT323, monospace'>
								Game ID: {id}
							</Typography>
							<Typography variant='subtitle1' mb={3} textAlign='center'>
								Share this code with your friends so they can join you!{' '}
							</Typography>
							<Typography
								fontFamily='VT323, monospace'
								variant='h3'
								textAlign='center'
								sx={{
									color: game.currentTurn === user ? yourColor : theirColor,
								}}>
								{game.currentTurn === user && (
									<ChevronRightIcon sx={{ height: '40px' }} />
								)}
								Current Turn: {game.currentTurn}
								{game.currentTurn === user && " (Psst.. it's your turn!)"}
							</Typography>
							{over.isOver && (
								<Typography
									variant='h3'
									textAlign='center'
									mt={2}
									color='primary'
									fontFamily='VT323, monospace'>
									{over.winner
										? over.winner === user
											? 'You Win!'
											: 'You Lose!'
										: 'Draw!'}
								</Typography>
							)}
							{over.isOver && (
								<Button variant='contained' onClick={() => navigate('/')}>
									Play Again
								</Button>
							)}
						</Stack>
						<Stack
							direction='row'
							alignItems='center'
							justifyContent='space-between'
							p={2}
							borderRadius={3}
							elevation={3}
							m={2}
							component={Paper}>
							{game && (
								<Stack mr={3}>
									<Typography
										variant='h5'
										fontFamily='VT323, monospace'
										fontSize='30px'>
										Score
									</Typography>
									<Stack direction='row' alignItems='center' spacing={3}>
										<Typography
											color={yourColor}
											fontWeight='bold'
											fontFamily='VT323, monospace'
											fontSize='28px'>
											You:{' '}
											{game.initiator?.id === user
												? getScore(true, game)
												: getScore(false, game)}
										</Typography>
										<Typography
											color={theirColor}
											fontWeight='bold'
											fontFamily='VT323, monospace'
											fontSize='28px'>
											Them:{' '}
											{game.initiator?.id !== user
												? getScore(true, game)
												: getScore(false, game)}
										</Typography>
									</Stack>
								</Stack>
							)}

							{game && (
								<Stack
									direction='row'
									alignItems='center'
									justifyContent='space-between'>
									<Stack spacing={4} direction='row' alignItems='center' ml={3}>
										<Stack direction='row' alignItems='center' spacing={3}>
											<ForestIcon sx={{ color: green[600] }} />
											<Typography
												fontWeight='bold'
												fontSize='28px'
												mt={2}
												fontFamily='VT323, monospace'>
												{game.initiator?.id === user
													? game.initiator.currency.wood
													: game.opponent?.currency?.wood}
											</Typography>
										</Stack>
										<Stack direction='row' alignItems='center' spacing={3}>
											<LandscapeIcon sx={{ color: grey[400] }} />
											<Typography
												fontWeight='bold'
												fontSize='28px'
												mt={2}
												fontFamily='VT323, monospace'>
												{game.initiator?.id === user
													? game.initiator.currency.stone
													: game.opponent?.currency?.stone}
											</Typography>
										</Stack>
									</Stack>
								</Stack>
							)}
							<Button
								variant='contained'
								startIcon={<BookIcon />}
								onClick={() => setIsRulesOpen(true)}
								sx={{ width: '200px' }}>
								Rules
							</Button>
							<RulesDialog
								open={isRulesOpen}
								handleClose={() => setIsRulesOpen(false)}
							/>
						</Stack>
					</Grid>
				</Stack>
			</Grid>
			<Grid xs={10} xsOffset={1}>
				{game && !over.isOver && (
					<Stack>
						<Stack
							p={2}
							component={Paper}
							elevation={5}
							sx={{
								backgroundColor: blueGrey[700],
								border: `6px solid ${blueGrey[400]}`,
							}}>
							{game?.board?.map((column, rowIndex) => {
								return (
									<Stack direction='row' alignItems='center' spacing={2} my={2}>
										{column?.map((item, columnIndex) => (
											<ItemCard
												isTurn={isTurn}
												row={item}
												isInitiator={game.initiator.id === user}
												updateGame={updateGame}
												rowIndex={rowIndex}
												columnIndex={columnIndex}
												game={game}
											/>
										))}
									</Stack>
								);
							})}
						</Stack>
					</Stack>
				)}
			</Grid>
		</Grid>
	);
}

function ItemCard({
	row,
	updateGame,
	rowIndex,
	columnIndex,
	isTurn,
	isInitiator,
	game,
}) {
	const { user } = useUserContext();
	return (
		<Card
			sx={{
				flexGrow: 1,
				borderRadius: 3,
				border:
					row.owner === user
						? `3px solid ${yourColor}`
						: row.owner
						? `3px solid ${theirColor}`
						: undefined,
			}}>
			<CardContent>
				<CardActionArea
					disabled={
						!canSelectCard(
							row.tile,
							isInitiator,
							isTurn,
							rowIndex,
							game.board,
							user,
							row.owner
						)
					}
					onClick={() =>
						updateGame({
							rowIndex,
							columnIndex,
							tile: { tile: row.tile, owner: user },
						})
					}>
					<Stack justifyContent='center' alignItems='center'>
						<CardMedia
							component='img'
							sx={{ height: '100px', width: '100px' }}
							src={getCardImage(row, user) ?? ''}
							alt={`${row.tile} image`}
						/>
						<Typography textAlign='center'>{row.tile}</Typography>
					</Stack>
				</CardActionArea>
				{row.owner === user &&
					row.tile !== TileTypes.CASTLE &&
					row.tile !== TileTypes.FORTRESS && (
						<CardActions>
							<Stack
								width='100%'
								direction='row'
								alignItems='center'
								justifyContent='space-between'>
								<Button
									variant='contained'
									disabled={
										!isTurn ||
										!canBuildCastle(
											isInitiator
												? game.initiator.currency
												: game.opponent.currency
										)
									}
									onClick={() => {
										updateGame({
											rowIndex,
											columnIndex,
											tile: { tile: TileTypes.CASTLE, owner: user },
										});
									}}>
									<Stack>
										<Box>Build Castle</Box>
										<Stack direction='row' alignItems='center' spacing={1}>
											<Stack direction='row' alignItems='center' spacing={1}>
												<Typography>({EXPENSE.castle.wood})</Typography>
												<ForestIcon sx={{ color: green[600] }} />
											</Stack>
											<Stack direction='row' alignItems='center' spacing={1}>
												<Typography>({EXPENSE.castle.stone})</Typography>
												<LandscapeIcon sx={{ color: grey[700] }} />
											</Stack>
										</Stack>
									</Stack>
								</Button>
								<Button
									variant='contained'
									disabled={
										!isTurn ||
										!canBuildFortress(
											isInitiator
												? game.initiator.currency
												: game.opponent.currency
										)
									}
									onClick={() => {
										updateGame({
											rowIndex,
											columnIndex,
											tile: { tile: TileTypes.FORTRESS, owner: user },
										});
									}}>
									<Stack>
										<Box>Build Fortress</Box>
										<Stack direction='row' alignItems='center' spacing={1}>
											<Stack direction='row' alignItems='center' spacing={1}>
												<Typography>({EXPENSE.fortress.wood})</Typography>
												<ForestIcon sx={{ color: green[600] }} />
											</Stack>
											<Stack direction='row' alignItems='center' spacing={1}>
												<Typography>({EXPENSE.fortress.stone})</Typography>
												<LandscapeIcon sx={{ color: grey[700] }} />
											</Stack>
										</Stack>
									</Stack>
								</Button>
							</Stack>
						</CardActions>
					)}
			</CardContent>
		</Card>
	);
}

function getCardImage(row: Tile, user: string) {
	return TileImages[row.tile];
}

function canSelectCard(
	tileType: TileTypes,
	isInitiator: boolean,
	isTurn: boolean,
	rowIndex: number,
	board: Array<Array<Tile>>,
	user: string,
	owner: string
) {
	if (!isTurn) return false;

	if (
		(tileType === TileTypes.CASTLE || tileType === TileTypes.FORTRESS) &&
		owner
	) {
		return false;
	}

	if (owner === user) return false;

	return true;
}

function canBuildCastle(currency: { wood: number; stone: number }) {
	return (
		currency.wood >= EXPENSE.castle.wood &&
		currency.stone >= EXPENSE.castle.stone
	);
}
function canBuildFortress(currency: { wood: number; stone: number }) {
	return (
		currency.wood >= EXPENSE.fortress.wood &&
		currency.stone >= EXPENSE.fortress.stone
	);
}

function getScore(isInitiator: boolean, game: Game) {
	if (!game.board) return 0;
	if (isInitiator) {
		const castleScore = game.board.reduce((acc, cur) => {
			const owned =
				cur.filter(
					(row) =>
						row.owner === game.initiator.id && row.tile === TileTypes.CASTLE
				).length * 3;
			return acc + owned;
		}, 0);
		const fortressScore = game.board.reduce((acc, cur) => {
			const owned =
				cur.filter(
					(row) =>
						row.owner === game.initiator.id && row.tile === TileTypes.FORTRESS
				).length * 2;
			return acc + owned;
		}, 0);
		return castleScore + fortressScore;
	} else {
		const castleScore = game.board.reduce((acc, cur) => {
			const owned =
				cur.filter(
					(row) =>
						row.owner === game.opponent.id && row.tile === TileTypes.CASTLE
				).length * 3;
			return acc + owned;
		}, 0);
		const fortressScore = game.board.reduce((acc, cur) => {
			const owned =
				cur.filter(
					(row) =>
						row.owner === game.opponent.id && row.tile === TileTypes.FORTRESS
				).length * 2;
			return acc + owned;
		}, 0);
		return castleScore + fortressScore;
	}
}
