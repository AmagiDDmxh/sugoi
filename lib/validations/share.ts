import * as z from "zod"

export const shareSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Must be 1 or more characters long" })
    .max(64),
  // Use union to make optional string, see https://zod.dev/?id=unions
  link: z.union([
    z.string().url({ message: "Invalid url" }).optional(),
    z.literal(""),
  ]),
  comment: z.union([z.string().min(2).max(256).optional(), z.literal("")]),
})
