import type { LoaderArgs, ActionArgs } from '@remix-run/deno';
import {
	getGameWithVersionstamp,
	setGame,
	subscribeGame,
} from '../server/game.server.ts';
import { TileTypes } from '../utils.ts';

export async function loader({ request }: LoaderArgs) {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');
	if (!id) {
		return new Response('Missing id', {
			status: 400,
		});
	}

	let cleanup: () => void;

	const body = new ReadableStream({
		start(controller) {
			controller.enqueue(`retry: 1000\n\n`);
			cleanup = subscribeGame(id, (game) => {
				const analysis = analyzeGame(game);
				const data = JSON.stringify({
					game,
					isOver: analysis.isOver,
					winner: analysis.winner,
				});
				controller.enqueue(`data: ${data}\n\n`);
			});
		},
		cancel() {
			cleanup();
		},
	});

	return new Response(body.pipeThrough(new TextEncoderStream()), {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
		},
	});
}

export async function action({ request }: ActionArgs) {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');
	const newGame = await request.json();
	const [gameRes] = await Promise.all([getGameWithVersionstamp(id)]);
	if (!gameRes) {
		return new Response('Game not found', {
			status: 404,
		});
	}
	const [game, gameVersionstamp] = gameRes;

	const isOpponentTurn = newGame.currentTurn === newGame.opponent.id;

	newGame.currentTurn = isOpponentTurn
		? newGame.initiator.id
		: newGame.opponent.id;
	const analysis = analyzeGame(game);

	const success = await setGame(newGame, gameVersionstamp);
	if (!success) {
		return new Response('Game has been updated/deleted while processing', {
			status: 409,
		});
	}
	console.log('gonna return?', game);
	return new Response(
		JSON.stringify({ game, isOver: analysis.isOver, winner: analysis.winner }),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

const ENDGAME = {
	castle: 4,
	fortress: 6,
};
const POINTS = {
	castle: 3,
	fortress: 2,
};

function analyzeGame(game) {
	const board = game.board;
	let isOver = false;
	const castles = board.reduce((acc, curr) => {
		return (
			acc +
			curr.filter((tile) => tile.tile === TileTypes.CASTLE && !!tile.owner)
				.length
		);
	}, 0);
	const fortresses = board.reduce((acc, curr) => {
		return (
			acc +
			curr.filter((tile) => tile.tile === TileTypes.FORTRESS && !!tile.owner)
				.length
		);
	}, 0);
	if (castles >= ENDGAME.castle) {
		isOver = true;
	} else if (fortresses >= ENDGAME.fortress) {
		isOver = true;
	}
	let winner = false;
	if (isOver) {
		const initiatorCastleScore = board.reduce((acc, curr) => {
			return (
				acc +
				curr.filter(
					(tile) =>
						tile.tile === TileTypes.CASTLE && tile.owner === game.initiator.id
				).length *
					POINTS.castle
			);
		}, 0);
		const initiatorFortressScore = board.reduce((acc, curr) => {
			return (
				acc +
				curr.filter(
					(tile) =>
						tile.tile === TileTypes.FORTRESS && tile.owner === game.initiator.id
				).length *
					POINTS.fortress
			);
		}, 0);
		const opponentCastleScore = board.reduce((acc, curr) => {
			return (
				acc +
				curr.filter(
					(tile) =>
						tile.tile === TileTypes.CASTLE && tile.owner === game.opponent.id
				).length *
					POINTS.castle
			);
		}, 0);
		const opponentFortressScore = board.reduce((acc, curr) => {
			return (
				acc +
				curr.filter(
					(tile) =>
						tile.tile === TileTypes.FORTRESS && tile.owner === game.opponent.id
				).length *
					POINTS.fortress
			);
		}, 0);
		const initiatorScore = initiatorCastleScore + initiatorFortressScore;
		const opponentScore = opponentCastleScore + opponentFortressScore;
		if (initiatorScore > opponentScore) {
			winner = game.initiator.id;
		} else if (opponentScore > initiatorScore) {
			winner = game.opponent.id;
		}
	}
	return {
		isOver,
		winner,
	};
}
