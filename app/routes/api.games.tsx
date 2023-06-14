import type { LoaderArgs, ActionArgs } from '@remix-run/deno';
import { json } from '@remix-run/deno';
import {
	getGames,
	setGame,
	subscribeGamesByPlayer,
} from '../server/game.server.ts';

export async function loader({ request }: LoaderArgs) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get('userId');
	let cleanup: () => void;
	if (!userId) throw new Error('userId is required');
	const body = new ReadableStream({
		start(controller) {
			controller.enqueue(`retry: 1000\n\n`);
			cleanup = subscribeGamesByPlayer(userId, (games) => {
				const data = JSON.stringify(games);
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
	const data = await request.json();

	const returnData = await setGame(data);
	return json({ data });
}
