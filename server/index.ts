import { serve } from 'https://deno.land/std@0.166.0/http/server.ts';
import { Server } from 'https://deno.land/x/socket_io@0.2.0/mod.ts';
import { Application } from 'https://deno.land/x/oak@v11.1.0/mod.ts';

const app = new Application();

app.use(async (context, next) => {
	try {
		await context.send({
			root: `${Deno.cwd()}/build`,
			index: 'index.js',
		});
	} catch {
		await next();
	}
});

const io = new Server();

io.on('connection', (socket) => {
	console.log(`socket ${socket.id} connected`);

	socket.emit('hello', 'world');

	socket.on('disconnect', (reason) => {
		console.log(`socket ${socket.id} disconnected due to ${reason}`);
	});
});

const handler = io.handler(async (req) => {
	return (await app.handle(req)) || new Response(null, { status: 404 });
});

await serve(handler, {
	port: 3000,
});
