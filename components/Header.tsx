"use client"

import React, { startTransition } from "react"
import Link from "next/link"
import { siteConfig } from "#/config/site"
import { cn } from "#/lib/utils"
import { GithubIcon, LightbulbIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Icons } from "./Icons"
import { Button, buttonVariants } from "./ui/button"

export const Header = () => {
  const { setTheme, theme } = useTheme()
  // const [_, startTransition] = React.useTransition()

  return (
    <div className="flex items-end justify-between px-1">
      <div className="flex flex-col space-y-1">
        <Link
          href="/"
          className="inline-flex space-x-1 font-semibold hover:opacity-80"
        >
          <Icons.Love />
          <h4>Sugoi</h4>
        </Link>
        <p className="text-xs text-slate-700 dark:text-slate-50">😉 Score everything you love</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.github}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "group"
          )}
        >
          <GithubIcon className="stroke-primary/90 dark:group-hover:fill-primary mr-2 h-4 w-4 fill-slate-300 transition-colors duration-200 group-hover:fill-slate-600 dark:fill-slate-600" />
          <h5>Source</h5>
        </Link>
        {/* TODO: Theme switcher */}
        <Button
          size="sm"
          variant="outline"
          // className="group drop-shadow-2xl transition-all hover:shadow-slate-900 dark:shadow-2xl dark:shadow-slate-400"
          onClick={() => {
            startTransition(() => {
              setTheme(theme === "light" ? "dark" : "light")
            })
          }}
        >
          {theme && (
            <LightbulbIcon
              className={cn(
                "h-4 w-4 transition-all",
                theme === "dark"
                  ? "fill-slate-300 stroke-slate-300 shadow-rose-400 drop-shadow-2xl group-hover:fill-orange-400 group-hover:shadow-slate-300"
                  : "fill-orange-400 stroke-slate-700 shadow-rose-400 drop-shadow-2xl group-hover:fill-slate-300 group-hover:shadow-slate-300"
              )}
            />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>
  )
}
