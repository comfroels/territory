import type { LoaderArgs } from '@remix-run/deno';
import { getGame } from '../server/game.server.ts';

export async function loader({ request, params }: LoaderArgs) {
	console.log('params.get', params.id);

	const game = await getGame(params.id);
	return game;
}
