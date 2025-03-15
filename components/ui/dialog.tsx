"use client"

import * as React from "react"
import { useMediaQuery } from "#/hooks/useMediaQuery"
import { cn } from "#/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Drawer } from "vaul"

const DialogRoot = (props: React.ComponentProps<typeof Drawer.Root>) =>
  useMediaQuery().large ? (
    <DialogPrimitive.Root {...props} />
  ) : (
    <Drawer.Root {...props} />
  )

DialogRoot.displayName = DialogPrimitive.Root.displayName

const DialogTrigger = ({
  className,
  ...props
}: DialogPrimitive.DialogTriggerProps) =>
  useMediaQuery().large ? (
    <DialogPrimitive.Trigger className={cn(className)} {...props} />
  ) : (
    <Drawer.Trigger className={cn(className)} {...props} />
  )
DialogTrigger.displayName = DialogPrimitive.Portal.displayName

const DialogPortal = ({
  className,
  ...props
}: DialogPrimitive.DialogPortalProps) =>
  useMediaQuery().large ? (
    <DialogPrimitive.Portal className={cn(className)} {...props} />
  ) : (
    <Drawer.Portal className={cn(className)} {...props} />
  )
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogPrimitive.DialogOverlayProps
>(({ className, ...props }, ref) =>
  useMediaQuery().large ? (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40",
        className
      )}
      {...props}
    />
  ) : (
    <Drawer.Overlay
      ref={ref}
      className={cn("fixed inset-0 bg-black/40", className)}
      {...props}
    />
  )
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    onClose: () => void
  }
>(({ className, children, onClose, ...props }, ref) =>
  useMediaQuery().large ? (
    <DialogPortal>
      <DialogOverlay onClick={onClose} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg md:w-full",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          onClick={onClose}
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
        >
          <Cross2Icon className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  ) : (
    <>
      <DialogPortal>
        <DialogOverlay onClick={onClose} />
        <Drawer.Content
          ref={ref}
          className={cn(
            "fixed inset-x-0 bottom-0 mt-24 flex flex-col rounded-t-[10px] bg-zinc-100",
            className
          )}
          {...props}
        >
          <div className="flex-1 rounded-t-[10px] bg-white p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />
            <div className="mx-auto max-w-md">{children}</div>
          </div>
        </Drawer.Content>
      </DialogPortal>
    </>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

export {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
}
