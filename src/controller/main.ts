import type { App } from '../index';
import { zValidator } from '@hono/zod-validator'
import * as schemaValidator from '../validator';
import { User } from '../database/schema';
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
        const searchUsers = await db.select().from(User).where(eq(User.name,username)).limit(1).execute();

        if(searchUsers.length > 0){
            const verify = await Bun.password.verify(password, searchUsers[0].password)
            if(verify){
                const { googleId, discordId, status, deletedAt, createdAt, password, ...user } = searchUsers[0];
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
        }else{
            c.status(404)
            return c.json({
                status: false,
                error: "User not found"
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
        const user = await db.insert(User).values({
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
        const userSearched = await db.select().from(User).where(eq(User.id,parseInt(id))).limit(1).execute();
        if(userSearched.length > 0){
            const { googleId, discordId, status, deletedAt, createdAt, password, ...user } = userSearched[0];
            return c.json({
                status: true,
                data: {user}
            })
        }else{
            c.status(404)
            return c.json({
                status: false,
                error: "User not found"
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
        const user = await db.update(User).set({
            lang,
            tags
        }).where(eq(User.id,userContext.id)).execute();
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

}
