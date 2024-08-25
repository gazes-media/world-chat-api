// server
import { serve } from '@hono/node-server';
import { Hono, type Context } from 'hono';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { db, memcached, type dataInformation } from './database';
import { basicAuth } from 'hono/basic-auth';
import { verifyUser } from './utils';
import { accounts, sessions, users, verificationTokens, type UserSelect } from './database/schema';
import { authHandler, initAuthConfig, verifyAuth, type AuthConfig } from "@hono/auth-js"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Discord from '@auth/core/providers/discord';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { CredentialsSignin } from '@auth/core/errors';
import dotenv from "dotenv";
dotenv.config();
const app = new Hono<{
  Variables: {
    user: UserSelect;
  };
}>();

export type App = typeof app;

function getAuthConfig(c: Context): AuthConfig {
  const url = new URL(c.req.url);
  return {
    basePath: "/auth",
    secret: process.env.AUTH_SECRET,
    redirectProxyUrl: url.protocol + "//" + url.host + "/redirect",
    providers: [
      Discord({
        clientId: process.env.DISCORD_ID,
        clientSecret: process.env.DISCORD_SECRET,
      }),
      Google({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
      Credentials({
        credentials: {
          username: {
          },
          password: {
          }
        },
        authorize: async (credents, req) => {
          const userExist = await verifyUser(credents.username as string, credents.password as string, db);
          if(userExist){
            return userExist;
          }else return new CredentialsSignin("Invalid credentials")
        },
      }),
    ],
    adapter: DrizzleAdapter(db,{
      usersTable: users,
      sessionsTable: sessions,
      accountsTable: accounts,
      verificationTokensTable: verificationTokens
    }),
  }
}

app.use("*", initAuthConfig(getAuthConfig))

app.use("/auth/*", authHandler())

app.use('/api/*', verifyAuth())

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
