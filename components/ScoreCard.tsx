"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { Slider, SliderProps } from "#/components/ui/slider"
import { useCopyToClipboard } from "#/hooks/useCopyToClipboard"
import { Love } from "#/lib/types"
import { cn } from "#/lib/utils"
import { getTwitterUrl } from "@phntms/react-share"
import { useOverlayTriggerState } from "react-stately"
import { Toaster, toast } from "sonner"

import { ShareDialog, ShareFormData } from "./ShareDialog"
import { buttonVariants } from "./ui/button"

const SLIDER_DATA = [
  {
    section: "to Yourself and Friends",
    title: "Love",
    marks: { 0: "no", 25: "low", 50: "middle", 75: "high", 100: "∞" },
  },
  {
    title: "Usefulness",
    marks: { 0: "no", 50: "unknown", 100: "great" },
    step: 50,
  },
  {
    section: "to Public",
    title: "Usage",
    marks: { 0: "no", 25: "few", 50: "medium", 75: "lot", 100: "very much" },
  },
  {
    title: "Value",
    marks: {
      0: "no",
      25: "low",
      50: "middle",
      75: "high",
      100: "∞",
    },
  },
]

type ScoreTuple = [love: number, useness: number, usage: number, value: number]
const defaultScores: ScoreTuple = [0, 50, 0, 0]

const THINGS_PLACEHOLDERS = [
  "make a TODO app",
  "design",
  "code",
  "a youtuber",
  "exercise",
  "make an ai chat",
  "an influencer",
  "a product",
  "a dev tool",
]

type ScoreCardProps = React.HTMLAttributes<HTMLDivElement> & {
  love?: Love | null
}

export const ScoreCard = ({
  love: sharedLove,
  ...cardProps
}: ScoreCardProps) => {
  console.log("🚀 ~ sharedLove:", sharedLove)
  const [scores, setScores] = React.useState<ScoreTuple>(() => {
    if (sharedLove) {
      const { love, usefulness, usage, value } = sharedLove.scores
      return [love, usefulness, usage, value]
    }
    return defaultScores
  })
  const [love, usefulness, usage, value] = scores
  const totalScore = (
    (love * 0.35 + usefulness * 0.65) * 0.5 +
    (usage * 0.5 + value * 0.5) * 0.5
  ).toFixed(2)
  const [transitionNumber, setTransitionNumber] = React.useState(0)
  React.useEffect(() => {
    const transitionTimeout = setInterval(() => {
      setTransitionNumber((x) => (x + 1) % THINGS_PLACEHOLDERS.length)
    }, 2333)

    return () => {
      clearInterval(transitionTimeout)
    }
  }, [])

  const scoreHeaderContent = React.useMemo(() => {
    if (sharedLove) {
      // Remove last '/' chars
      const url = new URL(window.location.href)
      url.pathname = sharedLove.sharePath ?? ""
      const normalizedLink = url.toString()
      const { name, comment } = sharedLove

      const params = new URLSearchParams({
        type: name,
        heading: comment || `My love to ${name} is ${totalScore}!`,
      })

      if (normalizedLink) {
        params.set("link", normalizedLink)
      }

      return (
        <div className="flex flex-col space-y-2">
          {!!normalizedLink && (
            <a
              href={normalizedLink}
              target="_blank"
              className="overflow-hidden bg-slate-400"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/og?${params.toString()}`}
                width="100%"
                alt={`Cover to ${sharedLove.name}`}
                className="transition-transform hover:scale-105"
              />
            </a>
          )}
          <a
            href={normalizedLink}
            target="_blank"
            className="text-2xl font-bold underline-offset-4 hover:underline"
          >
            {sharedLove.name}
          </a>
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-md font-medium">
              My Score to{" "}
              <a
                href={normalizedLink}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "sm" }),
                  "px-0 text-base font-bold"
                )}
              >
                {sharedLove.name}
              </a>{" "}
              is <span className="text-base font-bold">{totalScore}</span>
            </CardTitle>
            {sharedLove.comment && (
              <p className="text-md font-normal text-slate-900">
                {sharedLove.comment}
              </p>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex space-x-1">
        <CardTitle className="text-md font-medium">
          Score your love to
        </CardTitle>
        <CardTitle className="text-md font-bold transition-all">
          {THINGS_PLACEHOLDERS[transitionNumber]}
        </CardTitle>
      </div>
    )
  }, [sharedLove, totalScore, transitionNumber])

  const dialogState = useOverlayTriggerState({
    defaultOpen: false,
  })
  const { copyToClipboard } = useCopyToClipboard()
  const copyShareLink = React.useCallback(
    async (love: Love) => {
      if (!love.sharePath) {
        return toast.error("Could not copy share link to clipboard")
      }

      try {
        const url = new URL(window.location.href)
        url.pathname = love.sharePath
        copyToClipboard(url.toString())
        dialogState.close()
        toast.success("Share link copied to clipboard")
      } catch (error) {
        const { message } = error as Error
        if (message) {
          toast.error(message)
        }
      }
    },
    [copyToClipboard, dialogState]
  )
  const openXLink = React.useCallback(
    (love: Love) => {
      if (!love.sharePath) {
        return toast.error("Could not open share link")
      }
      const url = new URL(window.location.href)
      const { name, comment } = love
      url.pathname = love.sharePath
      const xUrl = getTwitterUrl({
        text: `I love ${name}, ${comment}`,
        url: url.toString(),
      })
      window.open(xUrl, "_blank")
      dialogState.close()
      toast.success("Share link opened in new tab!")
    },
    [dialogState]
  )

  const createLove = React.useCallback(
    async (love: Partial<Love>): Promise<Love | { error: string }> => {
      const response = await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify(love),
      })
      const result = await response.json()
      if (response.ok) {
        return result
      }
      return {
        error: result,
      }
    },
    []
  )

  const handleX = async () => {
    if (sharedLove?.sharePath) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      openXLink(sharedLove)
      return
    }
  }

  const handleShare = React.useCallback(
    async (data?: ShareFormData) => {
      if (sharedLove?.sharePath) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        copyShareLink(sharedLove)
        return
      }

      if (!data) {
        toast.error("No data is available, make sure to fill the form")
        return
      }

      const lovePayload: Partial<Love> = {
        scores: {
          love,
          usefulness,
          usage,
          value,
        },
        name: data.name,
        link: data.link,
        comment: data.comment,
      }
      try {
        const result = await createLove(lovePayload)
        if (result && "error" in result) {
          toast.error(result.error as string)
          return
        }
        copyShareLink(result)
      } catch (error) {
        if (typeof error === "string") {
          toast.error(error)
        }
      }
      return
    },
    [copyShareLink, love, createLove, sharedLove, usage, usefulness, value]
  )

  return (
    <>
      <Toaster position="top-center" />

      <Card
        className={cn(
          "overflow-hidden",
          sharedLove ? "w-[512px]" : "w-[350px]"
        )}
        {...cardProps}
      >
        <CardHeader className="mb-2 border-b pb-6">
          {scoreHeaderContent}
        </CardHeader>
        {!sharedLove && (
          <CardContent>
            <div className="grid w-full space-y-8 pr-6">
              {SLIDER_DATA.map((x, index) => (
                <div className="flex flex-col space-y-4" key={x.title}>
                  {x.section && (
                    <h3 className="mt-4 font-semibold leading-none">
                      {x.section}
                    </h3>
                  )}
                  <div className="grid grid-cols-3 space-x-4">
                    <p className="text-sm leading-7">{x.title}</p>
                    <Slider
                      onValueChange={(v) =>
                        setScores(
                          (xs) =>
                            [
                              ...xs.slice(0, index),
                              v?.[0],
                              ...xs.slice(index + 1),
                            ] as ScoreTuple
                        )
                      }
                      className="col-span-2"
                      defaultValue={
                        sharedLove ? [scores[index]] : [x.step ?? 0]
                      }
                      marks={x.marks as SliderProps["marks"]}
                      disabled={!!sharedLove}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        {/* Spacer */}
        {sharedLove && <div className="h-2" />}
        <CardFooter className="mt-2 flex w-full items-center justify-between">
          <ShareDialog
            love={sharedLove}
            open={dialogState.isOpen}
            onOpen={dialogState.open}
            onClose={dialogState.close}
            onShare={handleShare}
            onX={handleX}
          />

          <div className="flex items-center space-x-1">
            <h3 className="font-medium leading-none tracking-tight">Total:</h3>
            <p className="text-lg font-medium">{totalScore}</p>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
