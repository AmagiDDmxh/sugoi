"use client"

import React, { useTransition } from "react"
import { useMediaQuery } from "#/hooks/useMediaQuery"
import { Love } from "#/lib/types"
import { shareSchema } from "#/lib/validations/share"
import { zodResolver } from "@hookform/resolvers/zod"
import { ForwardIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Icons } from "./Icons"
import { Button } from "./ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

export type ShareFormData = z.infer<typeof shareSchema>

export interface ShareDialogProps {
  open?: boolean
  onShare: (data?: ShareFormData) => void
  onOpen: () => void
  onClose: () => void
  onX: () => void
  love?: Love | null
}

export const ShareDialog = ({
  open = false,
  onClose,
  onOpen,
  onShare,
  onX,
  love,
}: ShareDialogProps) => {
  const { large } = useMediaQuery()

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: { name: "Code" },
  })

  const submit = handleSubmit(onShare)
  const [isSharing, startSharing] = useTransition()
  const handleShareClick = () => {
    startSharing(async () => {
      if (love) {
        return onShare()
      }
      return submit()
    })
  }
  const isLoading = isSharing || isSubmitting

  const shareDialogFooter = (
    <div className="flex flex-row justify-end space-x-4 lg:space-x-4">
      {love && (
        <Button
          size={large || love ? "sm" : "lg"}
          variant="outline"
          className="group"
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault()
            onX()
          }}
        >
          <Icons.X className="stroke-primary h-3 w-3 fill-slate-100 transition-colors duration-200 group-hover:fill-slate-800" />
        </Button>
      )}
      <Button
        size={large || love ? "sm" : "lg"}
        type="submit"
        disabled={isLoading}
        onClick={handleShareClick}
      >
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Copy Share Link
      </Button>
    </div>
  )

  if (love) {
    return shareDialogFooter
  }

  return (
    <DialogRoot open={open} shouldScaleBackground>
      <DialogTrigger asChild onClick={onOpen}>
        <Button variant="default" size="sm" className="group">
          <ForwardIcon className="mr-2 h-3 w-3 fill-slate-400 stroke-slate-200 transition-colors duration-200 group-hover:fill-white group-hover:stroke-white" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="min-h-[36vh] lg:min-h-fit" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>The Project</DialogTitle>
          <DialogDescription>
            Type your project name to start sharing your score with friends
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <div className="grid gap-y-2 py-10 pr-1 lg:py-2">
            <div className="grid grid-cols-12 items-center gap-x-4 gap-y-2 lg:my-0">
              <Label
                htmlFor="name"
                className="col-span-12 px-2 lg:col-span-2 lg:px-0"
              >
                Name
              </Label>
              <Input
                id="name"
                className="col-span-12 lg:col-span-10"
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors?.name && (
                <p className="col-start-1 col-end-12 px-2 text-xs text-red-600 lg:col-start-3">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-12 items-center gap-x-4 gap-y-2 lg:my-0">
              <Label
                htmlFor="link"
                className="col-span-12 px-2 lg:col-span-2 lg:px-0"
              >
                Link
              </Label>
              <Input
                id="link"
                className="col-span-12 lg:col-span-10"
                disabled={isSubmitting}
                {...register("link")}
              />
              {errors?.link && (
                <p className="col-start-1 col-end-12 px-2 text-xs text-red-600 lg:col-start-3">
                  {errors.link.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-12 items-center gap-x-4 gap-y-2 lg:my-0">
              <Label
                htmlFor="comment"
                className="col-span-12 px-2 lg:col-span-2 lg:px-0"
              >
                Comment
              </Label>
              <Textarea
                id="comment"
                className="col-span-12 lg:col-span-10"
                disabled={isSubmitting}
                {...register("comment")}
              />
              {errors?.comment && (
                <p className="col-start-1 col-end-12 px-2 text-xs text-red-600 lg:col-start-3">
                  {errors.comment.message}
                </p>
              )}
            </div>
          </div>

          {shareDialogFooter}
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
