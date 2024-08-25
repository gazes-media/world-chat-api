import z from "zod";

export const UserRegisterSchema = z.object({
    username: z.string().min(2).max(65),
    password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
    lang: z.string().nullable().default("en")
});

export const UserLoginSchema = z.object({
    username: z.string().min(2).max(65),
    password: z.string().min(8)
})

export const UserPatchSchema = z.object({
    tags: z.optional(z.array(z.string().min(2).max(250))),
    lang: z.optional(z.string().min(2).max(2)),
    profileUrl: z.optional(z.string().regex(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig).startsWith("http"))
})

