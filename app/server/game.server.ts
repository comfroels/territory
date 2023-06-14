import { TileTypes } from '../utils.ts';

export const setGameOld = async (game) => {
	const kv = await Deno.openKv();

	let id = game.id;
	if (!id) {
		id = Math.random().toString(36).slice(2);
	}
	await kv.set(['games', id], game);
	return id;
};

export const getGames = async () => {
	const kv = await Deno.openKv();
	const iter = kv.list<string>({ prefix: ['games'] });
	const games = [];
	for await (const res of iter) games.push(res);
	return games;
};

export const getAvailableGames = async () => {
	const kv = await Deno.openKv();
	const iter = kv.list<string>({ prefix: ['games_by_user', ''] });
	const games = [];
	for await (const res of iter) games.push(res);
	return games;
};

export interface Game {
	id: string;
	initiator: {
		id: string;
		currency: { wood: number; stone: number };
	};
	opponent: {
		id: string;
		currency: { wood: number; stone: number };
	};
	currentTurn: string;
	board: Array<Array<Tile>>;
	createdAt: number;
}

export interface Tile {
	owner: string | null;
	tile: TileTypes;
}

export async function setGame(game: Game, versionstamp?: string) {
	const kv = await Deno.openKv();
	const ao = kv.atomic();
	if (versionstamp) {
		ao.check({ key: ['games', game.id], versionstamp });
	}
	if (!game.createdAt) {
		game.createdAt = Date.now();
	}
	if (!game.currentTurn) {
		game.currentTurn = game.initiator.id;
	}
	const res = await ao
		.set(['games', game.id], game)
		.set(['games_by_user', game.initiator.id, game.id], game)
		.set(['games_by_user', game.opponent.id, game.id], game)
		.commit();
	if (res.ok) {
		const bc1 = new BroadcastChannel(`game/${game.id}`);
		bc1.postMessage({ game, versionstamp: res!.versionstamp });
		const bc2 = new BroadcastChannel(`games_by_user/${game.initiator.id}`);
		bc2.postMessage({ game, versionstamp: res!.versionstamp });
		const bc3 = new BroadcastChannel(`games_by_user/${game.opponent.id}`);
		bc3.postMessage({ game, versionstamp: res!.versionstamp });
		setTimeout(() => {
			bc1.close();
			bc2.close();
			bc3.close();
		}, 5);
	}
	return res.ok;
}

export async function listGamesByPlayer(userId: string): Promise<Game[]> {
	const kv = await Deno.openKv();
	const games: Game[] = [];
	const iter = kv.list<Game>({ prefix: ['games_by_user', userId] });
	for await (const { value } of iter) {
		games.push(value);
	}
	return games;
}

export async function getGame(id: string) {
	const kv = await Deno.openKv();
	const res = await kv.get<Game>(['games', id]);
	return res.value;
}

export async function getGameWithVersionstamp(id: string) {
	const kv = await Deno.openKv();
	const res = await kv.get<Game>(['games', id]);
	if (res.versionstamp === null) return null;
	return [res.value, res.versionstamp] as const;
}

export function subscribeGame(
	id: string,
	cb: (game: Game) => void
): () => void {
	const bc = new BroadcastChannel(`game/${id}`);
	let closed = false;
	let lastVersionstamp = '';
	getGameWithVersionstamp(id).then((res) => {
		if (closed) return;
		if (res) {
			lastVersionstamp = res[1];
			cb(res[0]);
		}
	});
	bc.onmessage = (ev) => {
		if (lastVersionstamp >= ev.data.versionstamp) return;
		cb(ev.data.game);
	};
	return () => {
		closed = true;
		bc.close();
	};
}

export function subscribeGamesByPlayer(
	userId: string,
	cb: (list: Game[]) => void
) {
	const bc = new BroadcastChannel(`games_by_user/${userId}`);
	let closed = false;
	listGamesByPlayer(userId).then((list) => {
		if (closed) return;
		cb(list);
		const lastVersionstamps = new Map<string, string>();
		bc.onmessage = (e) => {
			const { game, versionstamp } = e.data;

			if ((lastVersionstamps.get(game.id) ?? '') >= versionstamp) return;
			lastVersionstamps.set(game.id, versionstamp);
			for (let i = 0; i < list.length; i++) {
				if (list[i].id === game.id) {
					list[i] = game;
					cb(list);
					return;
				}
			}
			list.push(game);
			cb(list);
		};
	});
	return () => {
		closed = true;
		bc.close();
	};
}
