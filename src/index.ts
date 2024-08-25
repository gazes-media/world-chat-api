// server
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { db, memcached, type dataInformation } from './database';
import { basicAuth } from 'hono/basic-auth';
import { verifyUser } from './utils';
import type { UserSelect } from './database/schema';

const app = new Hono<{
  Variables: {
    user: UserSelect;
  };
}>();

export type App = typeof app;

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.use("/user/*", basicAuth({
  verifyUser: async(username, password, c) => {
     const userExist = await verifyUser(username, password, db);
     if(userExist){
        c.set("user", userExist);
       return true;
     }else return false;
  }
}));

app.use("/app/*", basicAuth({
  verifyUser: async(username, password, c) => {
     const userExist = await verifyUser(username, password, db);
     if(userExist){
        c.set("user", userExist);
       return true;
     }else return false;
  }
}));

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
  socket.on("login", (data: dataInformation) => {
    memcached.set(socket.id, data);
  })

  socket.on("disconnect", () => {
    memcached.delete(socket.id);
  })
  socket.on("error", () => {
    memcached.delete(socket.id);
  })
})


setInterval(() => {
    io.emit("hello", "world")
},1000)
