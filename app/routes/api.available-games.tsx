import { getAvailableGames } from '../server/game.server.ts';

export async function loader({ request }) {
	const availableGames = await getAvailableGames();
	return availableGames;
}
