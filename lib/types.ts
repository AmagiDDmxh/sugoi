export type Scores = {
  love: number
  usefulness: number
  usage: number
  value: number
}

export interface Love extends Record<string, any> {
  id: string
  name: string
  link?: string
  comment?: string
  createdAt: Date | number
  scores: Scores
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
