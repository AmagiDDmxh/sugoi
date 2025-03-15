import { Love } from "#/lib/types"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function getSharedLove(id: string) {
  const love = await redis.hgetall<Love>(`love:${id}`)

  if (!love || !love.sharePath) {
    return null
  }

  return love
}

export async function createAndSaveShareLove(love: Love) {
  const payload = {
    ...love,
    sharePath: `/share/${love.id}`,
  }

  await redis.hmset(`love:${love.id}`, payload)
  return payload
}
