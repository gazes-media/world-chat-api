import type { App } from '../index';
import { zValidator } from '@hono/zod-validator'
import * as schemaValidator from '../validator';
import { users } from '../database/schema';
import { db } from '../database';
import { eq } from 'drizzle-orm';
import { getRelativeUser, retrieveAlreadyExistingTags } from '../utils';

export function main(app: App) {

    app.post("/login", zValidator("json",schemaValidator.UserLoginSchema, (result, c) => {
        if (!result.success) {
          return c.json({
            status: false,
            error: result.error
          });
        }
      }),
    async (c) => {
        const { username, password } = c.req.valid("json");
        const searchUsers = await db.select().from(users).where(eq(users.name,username)).limit(1).execute();

        if(searchUsers.length > 0){
            // we need to check if a password exist
            if(searchUsers[0].password){
                const verify = await Bun.password.verify(password, searchUsers[0].password)
            if(verify){
                const { status, deletedAt, createdAt, password, ...user } = searchUsers[0];
                return c.json({
                    status: true,
                    data: {user}
                })
            } else {
                return c.json({
                    status: false,
                    error: "Invalid password"
                })
            }
            }else return c.json({
                status: false,
                error: "You need to login with your initial provider"
            })
        }else{
            c.status(404)
            return c.json({
                status: false,
                error: "users not found"
            });
        }

    })

    app.post("/register", zValidator("json",schemaValidator.UserRegisterSchema, (result, c) => {
        if (!result.success) {
          return c.json({
            status: false,
            error: result.error
          });
        }
      }),
    async (c) => {
        const { username, password, lang } = c.req.valid("json");
        const hashedPassword = await Bun.password.hash(password);
        const user = await db.insert(users).values({
            name: username,
            password: hashedPassword,
            tags: ["user"],
            lang: lang || "en"
        }).execute();

        return c.json({
            status: true,
            data: {user}
        })
    })

    app.get("/user/:id", async (c) => {
        const { id } = c.req.param()
        const userSearched = await db.select().from(users).where(eq(users.id,id)).limit(1).execute();
        if(userSearched.length > 0){
            const { status, deletedAt, createdAt, password, ...user } = userSearched[0];
            return c.json({
                status: true,
                data: {user}
            })
        }else{
            c.status(404)
            return c.json({
                status: false,
                error: "users not found"
            });
        }
    })


    app.patch("/user/edit", zValidator("json",schemaValidator.UserPatchSchema, (result, c) => {
        if (!result.success) {
          return c.json({
            status: false,
            error: result.error
          });
        }
      }),
    async (c) => {
        const userContext = c.get("user");
        const { lang, tags } = c.req.valid("json");
        const user = await db.update(users).set({
            lang,
            tags
        }).where(eq(users.id,userContext.id)).execute();
        return c.json({
            status: true,
            data: {user}
        })
    });


    app.get("/app/tags",async (c) => {
        const tags = await retrieveAlreadyExistingTags(db);
        return c.json({
            status: true,
            data: {tags}
        })
    })

    app.get("app/users/list", (c) => {
        const user = c.get("user");
        const usersRelative = getRelativeUser(user.tags);
        return c.json({
            status:true,
            data: { relatives: usersRelative}
        })
    })

    app.get("/test", (c) =>{
       const authUser = c.get("authUser");
       return c.json(authUser);
    });
}
