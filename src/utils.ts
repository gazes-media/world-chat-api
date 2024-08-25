import { eq } from "drizzle-orm";
import { memcached, type dataInformation, db } from "./database";
import { users } from "./database/schema";

/**
 *
 * @param {string[]} tags
 * @param {number[]} ids
 * @returns
 */
export function getRelativeUser(tags: string[], ids: number[] = []): dataInformation[] {
    // we will get all connected users to the socket and filter based on tags and return every users that could meet the criteria.
    // we need to exclude every ids in the ids array

    const users = Array.from(memcached.values());
    const filteredUsers = users.filter((user) => {
        if (user.tags.some((tag) => tags.includes(tag))) {
            return true;
        }
        return false;
    });

    const filtered= filteredUsers.filter((user) => !ids.includes(user.userId))
    // we only want 25 users MAX

    return filtered.slice(0, 25);
}


export async function retrieveAlreadyExistingTags(database: typeof db): Promise<string[]> {

    const tags = await database.select({
        tags: users.tags
    }).from(users).execute();

    const TagSet = new Set(tags.map((tag) => tag.tags).flat());
    return Array.from(TagSet.values());

}

export async function verifyUser(username: string, password: string, database: typeof db) {
    const searchUsers = await database.select().from(users).where(eq(users.name, username)).limit(1).execute();

    if (searchUsers.length > 0) {
        if(searchUsers[0].password){
            const verify = await Bun.password.verify(password, searchUsers[0].password);
        if (verify) {
            return searchUsers[0];
        }
        }else return false

    }
    return false;
}
