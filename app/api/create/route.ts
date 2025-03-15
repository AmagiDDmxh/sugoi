import { createAndSaveShareLove } from "#/app/actions"
import { Love } from "#/lib/types"
import { nanoid } from "#/lib/utils"
import { shareSchema } from "#/lib/validations/share"
import * as z from "zod"

const createSchema = shareSchema.merge(
  z.object({
    id: z.string().length(7).optional(),
    scores: z.object({
      love: z.number(),
      usefulness: z.number(),
      usage: z.number(),
      value: z.number(),
    }),
  })
)

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = createSchema.parse(json)
    const payload: Love = {
      ...body,
      id: body.id ?? nanoid(),
      createdAt: Date.now(),
    }
    const post = await createAndSaveShareLove(payload)

    return new Response(JSON.stringify(post))
  } catch (error) {
    console.log("🚀 ~ POST /create ~ error:", error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
