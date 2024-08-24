// server
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 });

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL as string);
const db = drizzle(queryClient);


const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running: http://${info.address}:${info.port}`);
  }
);

const io = new Server(server as HttpServer, {
  path: '/gateway',
  serveClient: true,
});

io.on("error", (err) => {
  console.log(err)
})

io.on("connection", (socket) => {
  socket.on("connect", (data) => {
    io.emit("message", data)
  })
})

setInterval(() => {
    io.emit("hello", "world")
},1000)
