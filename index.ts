// server
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
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

const ioServer = new Server(server as HttpServer, {
  path: '/gateway',
  serveClient: true,
});
ioServer.on("error", (err) => {
  console.log(err)
})

ioServer.on("connection", (socket) => {
  socket.on("message", (data) => {
    ioServer.emit("message", data)
  })
})

setInterval(() => {
  ioServer.emit("hello", "world")
},1000)
