import type { LoaderArgs } from '@remix-run/deno';
import { getGame } from '../server/game.server.ts';

export async function loader({ request, params }: LoaderArgs) {
	const game = await getGame(params.id);
	return game;
}
